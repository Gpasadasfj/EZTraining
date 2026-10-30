from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework.test import APIClient

User = get_user_model()

AVATAR_URL = "/api/users/me/avatar/"
REGISTER_URL = "/api/users/register/"


def make_image(name="foto.png", fmt="PNG", size=(1200, 800)):
    buffer = BytesIO()
    Image.new("RGB", size, "orange").save(buffer, format=fmt)
    return SimpleUploadedFile(name, buffer.getvalue(), content_type=f"image/{fmt.lower()}")


class AvatarTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ana", email="ana@test.com", password="pass1234")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def upload(self, image):
        return self.client.put(AVATAR_URL, {"avatar": image}, format="multipart")

    def test_upload_saves_square_webp(self):
        response = self.upload(make_image())

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.avatar.name.startswith("avatars/"))
        self.assertTrue(self.user.avatar.name.endswith(".webp"))
        with Image.open(self.user.avatar) as saved:
            self.assertEqual(saved.size, (512, 512))

    def test_replacing_deletes_previous_file(self):
        self.upload(make_image())
        self.user.refresh_from_db()
        old_name = self.user.avatar.name

        self.upload(make_image("otra.jpg", "JPEG"))

        self.user.refresh_from_db()
        self.assertNotEqual(self.user.avatar.name, old_name)
        self.assertFalse(self.user.avatar.storage.exists(old_name))

    def test_delete_removes_avatar_and_file(self):
        self.upload(make_image())
        self.user.refresh_from_db()
        name = self.user.avatar.name

        response = self.client.delete(AVATAR_URL)

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.avatar)
        self.assertFalse(self.user.avatar.storage.exists(name))

    def test_rejects_unsupported_format(self):
        response = self.upload(make_image("animada.gif", "GIF"))

        self.assertEqual(response.status_code, 400)
        self.assertIn("avatar", response.data)

    def test_rejects_file_that_is_not_an_image(self):
        fake = SimpleUploadedFile("foto.png", b"esto no es una imagen", content_type="image/png")

        response = self.upload(fake)

        self.assertEqual(response.status_code, 400)

    def test_me_does_not_change_avatar_or_current_weight(self):
        response = self.client.patch(
            "/api/users/me/", {"current_weight": 50, "first_name": "Ana"}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Ana")
        self.assertIsNone(self.user.current_weight)


class RegisterWithAvatarTest(TestCase):
    def test_register_with_optional_avatar(self):
        response = APIClient().post(
            REGISTER_URL,
            {"username": "luis", "email": "luis@test.com", "password": "pass1234", "avatar": make_image()},
            format="multipart",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username="luis")
        self.assertTrue(user.avatar.name.endswith(".webp"))

    def test_register_without_avatar_still_works(self):
        response = APIClient().post(
            REGISTER_URL,
            {"username": "luis", "email": "luis@test.com", "password": "pass1234"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertFalse(User.objects.get(username="luis").avatar)