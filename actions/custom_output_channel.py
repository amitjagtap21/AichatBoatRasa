from typing import Any, Dict, List, Text
from sanic import Blueprint, response
from rasa.core.channels.channel import InputChannel, UserMessage, CollectingOutputChannel


class CustomCollectingOutputChannel(CollectingOutputChannel):
    """Custom channel that keeps metadata from domain.yml responses."""

    @classmethod
    def name(cls) -> Text:
        return "custom_rest"

    async def _persist_message(self, message: Dict[str, Any]) -> None:
        # This is where we ensure metadata is kept
        self.messages.append(message)


class CustomRestInput(InputChannel):
    """Custom REST channel to expose metadata."""

    @classmethod
    def name(cls) -> Text:
        return "custom_rest"

    def blueprint(self, on_new_message):
        custom_webhook = Blueprint("custom_rest", __name__)

        @custom_webhook.route("/webhook", methods=["POST"])
        async def receive(request):
            payload = request.json
            sender_id = payload.get("sender", None)
            text = payload.get("message", None)
            metadata = payload.get("metadata", None)

            out = CustomCollectingOutputChannel()

            user_msg = UserMessage(
                text=text,
                output_channel=out,
                sender_id=sender_id,
                input_channel=self.name(),
                metadata=metadata,
            )

            await on_new_message(user_msg)

            # 🔑 patch: if Rasa response has "custom" field, merge it into output
            for m in out.messages:
                if "custom" in m and isinstance(m["custom"], dict):
                    m.update(m.pop("custom"))

            return response.json(out.messages)

        return custom_webhook
