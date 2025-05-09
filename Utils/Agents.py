import os
import threading
import google.generativeai as genai
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Base Agent class definition
class Agent:
    def __init__(self, medical_report=None, role=None, extra_info=None):
        self.medical_report = medical_report
        self.role = role
        self.extra_info = extra_info or {}
        self.prompt_template = self.create_prompt_template()
        self.model = genai.GenerativeModel("models/gemini-2.5-pro-exp-03-25")

    def create_prompt_template(self):
        if self.role == "MultidisciplinaryTeam":
            template = f"""
Act as a multidisciplinary team of healthcare professionals.
You will integrate reports from different specialists.
Task: Review the following specialist reports, analyze their findings, and generate a bullet-point list of 3 possible comprehensive health issues for the patient. For each issue, include a brief reason.

Cardiologist Report: {self.extra_info.get('Cardiologist', 'Not provided')}
Psychologist Report: {self.extra_info.get('Psychologist', 'Not provided')}
Pulmonologist Report: {self.extra_info.get('Pulmonologist', 'Not provided')}
Neurologist Report: {self.extra_info.get('Neurologist', 'Not provided')}
Endocrinologist Report: {self.extra_info.get('Endocrinologist', 'Not provided')}
Nutritionist Report: {self.extra_info.get('Nutritionist', 'Not provided')}
            """
        else:
            templates = {
                "Cardiologist": """
Act as a cardiologist. You will receive a medical report of a patient.
Task: Review the patient's cardiac workup (ECG, blood tests, Holter monitor results, echocardiogram) and identify subtle signs of cardiac issues (e.g., arrhythmias, ischemia, structural abnormalities).
Recommendation: Suggest further cardiac testing or interventions if needed.
Medical Report: {medical_report}
                """,
                "Psychologist": """
Act as a psychologist. You will receive a patient's report.
Task: Review the patient's report and assess for mental health issues such as anxiety, depression, or trauma.
Recommendation: Provide guidance on further evaluation or therapeutic interventions.
Patient's Report: {medical_report}
                """,
                "Pulmonologist": """
Act as a pulmonologist. You will receive a patient's report.
Task: Review the patient's respiratory workup (including spirometry and imaging if available) and identify potential issues such as asthma, COPD, or infections.
Recommendation: Suggest additional pulmonary testing or interventions if necessary.
Patient's Report: {medical_report}
                """,
                "Neurologist": """
Act as a neurologist. You will receive a patient's report.
Task: Evaluate the patient's neurological symptoms (e.g., headaches, dizziness, neuropathies) and identify possible neurological concerns.
Recommendation: Recommend further neurological tests or imaging studies if warranted.
Patient's Report: {medical_report}
                """,
                "Endocrinologist": """
Act as an endocrinologist. You will receive a patient's report with metabolic and hormonal data.
Task: Assess for endocrine disorders (e.g., diabetes, thyroid dysfunction, adrenal issues) based on the report.
Recommendation: Advise additional endocrine testing or follow-up if necessary.
Patient's Report: {medical_report}
                """,
                "Nutritionist": """
Act as a nutritionist. You will receive a patient's report including dietary history and relevant labs.
Task: Analyze the information to identify potential nutritional deficiencies or imbalances.
Recommendation: Provide dietary suggestions or propose further nutritional assessments.
Patient's Report: {medical_report}
                """
            }
            template = templates.get(self.role, "Role not defined.")
        return PromptTemplate.from_template(template)

    def run(self, context=None):
        print(f"{self.role} agent is running...")
        prompt = self.prompt_template.format(medical_report=self.medical_report)
        if context:
            prompt += "\n\nAdditional context from previous evaluations:\n" + context
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error occurred in {self.role} agent:", e)
            return None

# Specialized agents
class Cardiologist(Agent):
    def __init__(self, medical_report):
        super().__init__(medical_report, "Cardiologist")

class Psychologist(Agent):
    def __init__(self, medical_report):
        super().__init__(medical_report, "Psychologist")

class Pulmonologist(Agent):
    def __init__(self, medical_report):
        super().__init__(medical_report, "Pulmonologist")

class Neurologist(Agent):
    def __init__(self, medical_report):
        super().__init__(medical_report, "Neurologist")

class Endocrinologist(Agent):
    def __init__(self, medical_report):
        super().__init__(medical_report, "Endocrinologist")

class Nutritionist(Agent):
    def __init__(self, medical_report):
        super().__init__(medical_report, "Nutritionist")

class MultidisciplinaryTeam(Agent):
    def __init__(self, reports_dict):
        super().__init__(role="MultidisciplinaryTeam", extra_info=reports_dict)

# Coordinator with threading
class Coordinator:
    def __init__(self, medical_report):
        self.medical_report = medical_report
        self.agents = {
            "Cardiologist": Cardiologist(medical_report),
            "Psychologist": Psychologist(medical_report),
            # "Pulmonologist": Pulmonologist(medical_report),
            # "Neurologist": Neurologist(medical_report),
            # "Endocrinologist": Endocrinologist(medical_report),
            # "Nutritionist": Nutritionist(medical_report)
        }
        self.initial_reports = {}
        self.refined_reports = {}

    def threaded_run(self, role, agent, context=None, output_dict=None):
        output = agent.run(context)
        output_dict[role] = output

    def run_individual_assessments(self):
        print("Running individual assessments in parallel...")
        threads = []
        for role, agent in self.agents.items():
            t = threading.Thread(target=self.threaded_run, args=(role, agent, None, self.initial_reports))
            threads.append(t)
            t.start()
        for t in threads:
            t.join()
        return self.initial_reports

    def run_multidisciplinary_consensus(self, reports):
        print("Generating multidisciplinary team consensus...")
        mdt_agent = MultidisciplinaryTeam(reports_dict=reports)
        consensus_output = mdt_agent.run()
        print("Multidisciplinary Team output:")
        print(consensus_output)
        return consensus_output

    def run_interactive_refinement(self):
        self.run_individual_assessments()
        initial_consensus = self.run_multidisciplinary_consensus(self.initial_reports)
        print("Running interactive refinement in parallel...")
        threads = []
        for role, agent in self.agents.items():
            t = threading.Thread(target=self.threaded_run, args=(role, agent, initial_consensus, self.refined_reports))
            threads.append(t)
            t.start()
        for t in threads:
            t.join()
        final_consensus = self.run_multidisciplinary_consensus(self.refined_reports)
        return final_consensus

    def run_full_evaluation(self):
        return {
            "initial_reports": self.initial_reports,
            "refined_reports": self.refined_reports,
            "multidisciplinary_team": self.run_interactive_refinement()
        }

# Example usage
if __name__ == "__main__":
    sample_medical_report = "Patient presents with chest pain, fatigue, elevated blood pressure, and mild cognitive issues."
    coordinator = Coordinator(sample_medical_report)
    results = coordinator.run_full_evaluation()
    print("\nFinal Output:\n", results["multidisciplinary_team"])
