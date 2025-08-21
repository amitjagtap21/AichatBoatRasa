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

import base64
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests
import os
from rasa_sdk.events import AllSlotsReset
import openai
from rasa_sdk.events import SlotSet

openai.api_key = "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"

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
        key = tracker.get_slot("response_key")
        if not key:
            dispatcher.utter_message(text="⚠ No response_key provided")
            return []

        resp = domain.get("responses", {}).get(key, [{}])[0]
        text = resp.get("text", "")
        custom = resp.get("custom", {})

        unified_payload = {"text": text, **custom}
        dispatcher.utter_message(custom=unified_payload)

        #dispatcher.utter_message(json_message=unified_payload)
        return []
    

# -------------------------------
# Ask State (dropdown for all 50 US states)
# -------------------------------
class ActionAskState(Action):
    def name(self) -> Text:
        return "action_ask_state"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        states = [
            "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
            "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
            "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
            "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
            "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
            "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
            "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
            "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
        ]

        dispatcher.utter_message(
    custom={
        "payload": "dropdown",       # 👈 this matches the renderer key
        "data": {
            "options": [{"label": s, "value": s} for s in states]
        }
    }
)
        return []


class ActionHandleFile(Action):
    def name(self):
        return "action_handle_file"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: dict):
        # Get slots/entities
        filename = tracker.get_slot("filename")
        content = tracker.get_slot("content")

        if not filename or not content:
            dispatcher.utter_message(text="No file received. Please try again.")
            return []

        # Example: decode base64 content
        try:
            header, encoded = content.split(",", 1)  # split "data:image/jpeg;base64,..."
            file_bytes = base64.b64decode(encoded)
            
            # Save file locally (optional)
            with open(f"uploads/{filename}", "wb") as f:
                f.write(file_bytes)

            #dispatcher.utter_message(text=f"Processing your document... please wait ⏳")
        except Exception as e:
            dispatcher.utter_message(text=f"⚠️ Error processing file: {e}")
            return []

        return [SlotSet("filename", filename), SlotSet("content", content)]

import os, base64, re
import easyocr

class ActionExtractFileData(Action):
    def name(self):
        return "action_extract_file_data"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: dict):

        filename = tracker.get_slot("filename")
        content = tracker.get_slot("content")

        if not filename or not content:
            dispatcher.utter_message(text="⚠️ No file found to extract data.")
            return []

        try:
            # Decode base64 from tracker
            base64_data = content.split(",")[-1]
            file_bytes = base64.b64decode(base64_data)

            # Save temporarily
            file_path = f"uploads/{filename}"
            os.makedirs("uploads", exist_ok=True)
            with open(file_path, "wb") as f:
                f.write(file_bytes)

            # 🔍 OCR with EasyOCR
            reader = easyocr.Reader(['en'])
            results = reader.readtext(file_path)
            text = " ".join([res[1] for res in results])

            # ✅ Print the raw extracted text
            print("\n===== OCR Extracted Text =====")
            print(text)
            print("==============================\n")

            # Extract DOB
            dob_match = re.search(r"\b(?:DOB)\s+(\d{2}[\/\-]\d{2}[\/\-]\d{4})", text, re.IGNORECASE)

            # Extract Issue Date
            issue_match = re.search(r"\b(?:ISS|Issued|Issue Date)\s+(\d{2}[\/\-]\d{2}[\/\-]\d{4})", text, re.IGNORECASE)

            # Extract Expiry Date (handles EXP_05-01-2015, EXP: 05-01-2015, EXP 05-01-2015)
            exp_match = re.search(r"\b(?:EXP|Expiry|Expiration)[_ :]+(\d{2}[\/\-]\d{2}[\/\-]\d{4})", text, re.IGNORECASE)

            # Extract Name (after DOB, before DRIVER keyword)
            name_match = re.search(r"\d{6}\s+([A-Z ]+?)\s+DRIVER", text)
            # Example: "050177 ANNE CARR DRIVER" → ANNE CARR

            # Extract Address (line after DRIVER keyword until ZIP code)
            # Address: Look for street number + street name until city/state
            address_match = re.search(r"(\d{2,5}\s+[A-Z0-9\s]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Drive|Dr|Ln|Lane|Way|Ct|Court)\.?,?\s*[A-Z\s]+,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?)", text, re.IGNORECASE)

            # Example: "123 NORTH STATE ST. LANSING, MI 48918-0000"

            # Extract Gender / Sex
            sex_match = re.search(r"\bSex\s+([MF])\b", text)

            # Extract Height
            height_match = re.search(r"\bHgt\s+(\d{3})", text)  # e.g. 504 = 5'04"

            # Extract Eyes
            eyes_match = re.search(r"\bEyes\s+([A-Z]+)", text)

            # Extract ID/DD Number
            id_match = re.search(r"\bDD\s+(\d+)", text)

            print("Extracted Name:", name_match.group(1).title() if name_match else "Not Found")
            print("Extracted DOB:", dob_match.group(1) if dob_match else "Not Found")
            print("Extracted Issue Date:", issue_match.group(1) if issue_match else "Not Found")
            print("Extracted Expiry Date:", exp_match.group(1) if exp_match else "Not Found")
            print("Extracted Address:", address_match.group(1).title() if address_match else "Not Found")
            print("Extracted Sex:", sex_match.group(1) if sex_match else "Not Found")
            print("Extracted Height:", height_match.group(1) if height_match else "Not Found")
            print("Extracted Eyes:", eyes_match.group(1) if eyes_match else "Not Found")
            print("Extracted ID (DD):", id_match.group(1) if id_match else "Not Found")

            # 🔎 Simple parsing with regex
            # name_match = re.search(r"(?:Name|Full Name)[:\- ]+([A-Za-z ]+)", text, re.IGNORECASE)
            # dob_match = re.search(r"(?:DOB|Date of Birth)[:\- ]+(\d{2}[\/\-]\d{2}[\/\-]\d{4})", text, re.IGNORECASE)
            # id_match  = re.search(r"(?:ID|ID No|ID Number)[:\- ]+([A-Z0-9]+)", text, re.IGNORECASE)

            # name = name_match.group(1).strip() if name_match else "Unknown"
            # dob = dob_match.group(1).strip() if dob_match else "Unknown"
            # id_number = id_match.group(1).strip() if id_match else "Unknown"

            # 📌 Send response back to user
            # dispatcher.utter_message(
            #     text=f"✅ Extracted Data:\nName: {name}\nDOB: {dob}\nID: {id_number}"
            # )

            extracted_name = name_match.group(1).title() if name_match else "Not Found"
            extracted_dob = dob_match.group(1) if dob_match else "Not Found"
            extracted_issue_date = issue_match.group(1) if issue_match else "Not Found"
            extracted_expiry_date = exp_match.group(1) if exp_match else "Not Found"
            extracted_address = address_match.group(1).title() if address_match else "Not Found"
            extracted_gender = sex_match.group(1) if sex_match else "Not Found"
            extracted_height = height_match.group(1) if height_match else "Not Found"
            eyes_match.group(1) if eyes_match else "Not Found"
            extracted_id = id_match.group(1) if id_match else "Not Found"

            return [
                SlotSet("extracted_name", extracted_name),
                SlotSet("extracted_dob", extracted_dob),
                SlotSet("extracted_id_number", extracted_id),
                SlotSet("extracted_address", extracted_address),
                SlotSet("extracted_issue_date", extracted_issue_date),
                SlotSet("extracted_expiry_date", extracted_expiry_date),
                SlotSet("extracted_gender", extracted_gender),
                SlotSet("extracted_height", extracted_height),
                SlotSet("filename", filename),
                SlotSet("id_proof", "uploaded")   # ✅ mark proof as completed
            ]
                    
            # Store slots
            return [
                {"event": "slot", "name": "extracted_name", "value": extracted_name},
                {"event": "slot", "name": "extracted_dob", "value": extracted_dob},
                {"event": "slot", "name": "extracted_id_number", "value": extracted_id},
                {"event": "slot", "name": "extracted_address", "value": extracted_address},
                {"event": "slot", "name": "extracted_issue_date", "value": extracted_issue_date},
                {"event": "slot", "name": "extracted_expiry_date", "value": extracted_expiry_date},
                {"event": "slot", "name": "extracted_gender", "value": extracted_gender},
                {"event": "slot", "name": "extracted_height", "value": extracted_height},
                {"event": "slot", "name": "filename", "value": filename},
            ]
            

        except Exception as e:
            dispatcher.utter_message(text=f"❌ Error extracting file: {str(e)}")
            return []
        