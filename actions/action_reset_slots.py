from rasa_sdk import Action
from rasa_sdk.events import AllSlotsReset

class ActionResetSlots(Action):
    def name(self):
        return "action_reset_slots"

    def run(self, dispatcher, tracker, domain):
        return [AllSlotsReset()]