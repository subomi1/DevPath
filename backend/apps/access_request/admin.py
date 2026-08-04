from django.contrib import admin
from .models import AccessRequest, AccessRequestStatusLog

admin.site.register(AccessRequest)
admin.site.register(AccessRequestStatusLog)