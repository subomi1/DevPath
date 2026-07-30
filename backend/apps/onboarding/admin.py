from django.contrib import admin
from .models import (
    OnboardingTemplate, TemplatePhase, TemplateTask, TemplateTaskResource,
    DeveloperJourney, JourneyPhase, JourneyTask
)

admin.site.register(OnboardingTemplate)
admin.site.register(TemplatePhase)
admin.site.register(TemplateTask)
admin.site.register(TemplateTaskResource)
admin.site.register(DeveloperJourney)
admin.site.register(JourneyPhase)
admin.site.register(JourneyTask)