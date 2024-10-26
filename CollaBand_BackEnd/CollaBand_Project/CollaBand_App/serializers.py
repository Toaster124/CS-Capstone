from rest_framework import serializers
from .models import Chat, ChatMsg


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMsg
        exclude = ("chat",)


class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    class Meta:
        model = Chat
        fields = ["messages", "short_id"]

