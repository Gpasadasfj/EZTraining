from decimal import Decimal

from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse

from users.models import WeightLog

User = get_user_model()


class WeightLogViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="user2", email="user2@test.com", password="testpass123"
        )

    def test_unauthenticated_user_cannot_create_weight_log(self):
        url = reverse("weight-logs")

        response = self.client.post(url, {"weight": "78.50"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_creating_a_weight_log_updates_current_weight(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("weight-logs")

        response = self.client.post(url, {"weight": "78.50"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.user.refresh_from_db()
        self.assertEqual(self.user.current_weight, Decimal("78.50"))

    def test_current_weight_reflects_the_latest_log_created(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("weight-logs")

        self.client.post(url, {"weight": "80.00"})
        self.client.post(url, {"weight": "79.20"})

        self.user.refresh_from_db()
        self.assertEqual(self.user.current_weight, Decimal("79.20"))

    def test_user_only_sees_their_own_weight_logs(self):
        WeightLog.objects.create(user=self.other_user, weight=Decimal("90.00"))
        WeightLog.objects.create(user=self.user, weight=Decimal("70.00"))

        self.client.force_authenticate(user=self.user)
        url = reverse("weight-logs")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_other_user_cannot_delete_someone_elses_weight_log(self):
        weight_log = WeightLog.objects.create(user=self.user, weight=Decimal("75.00"))
        self.client.force_authenticate(user=self.other_user)
        url = reverse("weightlog-delete", kwargs={"pk": weight_log.pk})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(WeightLog.objects.filter(pk=weight_log.pk).exists())

    def test_owner_can_delete_their_weight_log(self):
        weight_log = WeightLog.objects.create(user=self.user, weight=Decimal("75.00"))
        self.client.force_authenticate(user=self.user)
        url = reverse("weightlog-delete", kwargs={"pk": weight_log.pk})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WeightLog.objects.filter(pk=weight_log.pk).exists())