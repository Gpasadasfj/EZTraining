from rest_framework.views import APIView
from rest_framework.response import Response

from dashboard.services import init_dashboard

class DashboardView(APIView):
    def get(self, request):
       data = init_dashboard(request.user)

       return Response(data)