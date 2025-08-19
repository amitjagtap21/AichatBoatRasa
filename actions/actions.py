# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []

# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
# import requests

# class ActionCheckInsuranceEligibility(Action):
#     def name(self):
#         return "action_check_insurance_eligibility"

#     def run(self, dispatcher, tracker, domain):
#         state = tracker.get_slot("state")
#         insurance_id = tracker.get_slot("insurance_id")

#         if not state or not insurance_id:
#             dispatcher.utter_message(text="Please provide your state and insurance ID.")
#             return []

#         # Simulated API call
#         eligibility = True if state.lower() in ["california", "texas", "new york"] else False
        
#         if eligibility:
#             dispatcher.utter_message(text=f"✅ Your insurance ({insurance_id}) is valid in {state}.")
#         else:
#             dispatcher.utter_message(text=f"❌ Sorry, your insurance is not valid in {state}.")
#         return []

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests
import os
from rasa_sdk.events import AllSlotsReset

class ActionCheckInsuranceEligibilityAPI(Action):
    def name(self) -> Text:
        return "action_check_insurance_eligibility_api"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        name = tracker.get_slot("name")
        dob = tracker.get_slot("dob")
        income = tracker.get_slot("income")
        insurance_type = tracker.get_slot("insurance_type")

        payload = {
            "name": name,
            "dob": dob,
            "income": income,
            "insurance_type": insurance_type
        }

        backend_url = os.getenv("BACKEND_URL", "http://localhost:3000")

        try:
            res = requests.post(
                f"{backend_url}/eligibility",
                json={**payload, "userId": tracker.sender_id},
                timeout=10
            )

            if res.status_code != 200:
                dispatcher.utter_message(text="❌ Error checking eligibility. Please try again later.")
                return []

            data = res.json()

            if data.get("result") and data["result"].get("eligible"):
                dispatcher.utter_message(
                    text=f"{name}, ✅ you are eligible for {insurance_type} insurance."
                )
            else:
                reason = data["result"].get("reason") if data.get("result") else "No reason provided"
                dispatcher.utter_message(
                    text=f"Sorry {name}, you are not eligible. Reason: {reason}"
                )

        except Exception as e:
            dispatcher.utter_message(
                text="⚠️ Sorry, could not check eligibility at the moment. Please try again later."
            )

        return []
    

class ActionResetAllSlots(Action):
    def name(self):
        return "action_reset_all_slots"

    async def run(self, dispatcher, tracker, domain):
        return [AllSlotsReset()]
    

import logging
logger = logging.getLogger(__name__)

class ActionUnifiedGreet(Action):
    def name(self):
        return "action_unified_greet"

    def run(self, dispatcher, tracker, domain):
        # Grab both text and custom from domain.yml
        resp = domain.get("responses", {}).get("utter_greet", [{}])[0]
        text = resp.get("text", "")
        custom = resp.get("custom", {})

        # Build ONE payload in `json_message`
        unified_payload = {"text": text, **custom}

        # Send ONLY json_message — no text arg
        dispatcher.utter_message(json_message=unified_payload)
        return []
