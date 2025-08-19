from typing import Any, Dict, List, Text
from sanic import Blueprint, response
from rasa.core.channels.channel import InputChannel, UserMessage, CollectingOutputChannel


class MergingOutputChannel(CollectingOutputChannel):
    """Output channel that merges text + custom into one message."""

    async def _persist_message(self, message: Dict[str, Any]) -> None:
        # If it's just text or just custom, store normally
        if not self.messages:
            self.messages.append(message)
            return

        last = self.messages[-1]

        # If previous was text and now we got custom → merge them
        if "text" in last and "custom" in message:
            merged = {**last, **message["custom"]}
            self.messages[-1] = merged
        # If previous was custom and now text → merge them
        elif "custom" in last and "text" in message:
            merged = {**message, **last["custom"]}
            self.messages[-1] = merged
        else:
            self.messages.append(message)


class CustomRestInput(InputChannel):
    @classmethod
    def name(cls) -> Text:
        return "custom_rest"

    def blueprint(self, on_new_message):
        custom_webhook = Blueprint("custom_rest", __name__)

        @custom_webhook.route("/webhook", methods=["POST"])
        async def receive(request):
            payload = request.json
            sender_id = payload.get("sender")
            text = payload.get("message")
            metadata = payload.get("metadata")

            out = MergingOutputChannel()

            message = UserMessage(
                text=text,
                output_channel=out,
                sender_id=sender_id,
                input_channel=self.name(),
                metadata=metadata,
            )
            await on_new_message(message)

            return response.json(out.messages)

        return custom_webhook
