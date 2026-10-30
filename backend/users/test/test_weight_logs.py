from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()

WEIGHT_LOGS_URL = "/api/users/weight-logs/"


class WeightLogTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ana", email="ana@test.com", password="pass1234")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def log(self, weight):
        return self.client.post(WEIGHT_LOGS_URL, {"weight": weight}, format="json").data["id"]

    def current_weight(self):
        self.user.refresh_from_db()
        return self.user.current_weight

    def test_logging_updates_current_weight(self):
        self.log(82)

        self.assertEqual(self.current_weight(), 82)

    def test_deleting_latest_log_restores_previous_weight(self):
        self.log(84)
        latest = self.log(82)

        response = self.client.delete(f"{WEIGHT_LOGS_URL}{latest}/")

        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.current_weight(), 84)

    def test_deleting_older_log_keeps_current_weight(self):
        older = self.log(84)
        self.log(82)

        self.client.delete(f"{WEIGHT_LOGS_URL}{older}/")

        self.assertEqual(self.current_weight(), 82)

    def test_deleting_only_log_clears_current_weight(self):
        only = self.log(82)

        self.client.delete(f"{WEIGHT_LOGS_URL}{only}/")

        self.assertIsNone(self.current_weight())

    def test_cannot_delete_other_users_log(self):
        other = User.objects.create_user(username="luis", email="luis@test.com", password="pass1234")
        other_client = APIClient()
        other_client.force_authenticate(user=other)
        log_id = other_client.post(WEIGHT_LOGS_URL, {"weight": 70}, format="json").data["id"]

        response = self.client.delete(f"{WEIGHT_LOGS_URL}{log_id}/")

        self.assertEqual(response.status_code, 404)