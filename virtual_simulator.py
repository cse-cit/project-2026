import tkinter as tk
from tkinter import messagebox
import requests
from datetime import datetime, timezone
import threading

class ResQNetSimulator:
    def __init__(self, master):
        self.master = master
        self.master.title("ResQNet | Vehicle Telemetry Node")
        self.master.geometry("400x350")
        
        # Ingress API Endpoint (Points to the active Ngrok Cloud URL)
        self.server_url = "http://127.0.0.1:5000/api/crash"

        # UI Input Form Fields
        tk.Label(master, text="Vehicle ID:", font=('Arial', 10, 'bold')).pack(pady=2)
        self.entry_id = tk.Entry(master, width=30)
        self.entry_id.insert(0, "JH-01-XX-9999")
        self.entry_id.pack()

        tk.Label(master, text="Speed (km/h):", font=('Arial', 10, 'bold')).pack(pady=2)
        self.entry_speed = tk.Entry(master, width=30)
        self.entry_speed.insert(0, "78.5")
        self.entry_speed.pack()

        tk.Label(master, text="Latitude:", font=('Arial', 10, 'bold')).pack(pady=2)
        self.entry_lat = tk.Entry(master, width=30)
        self.entry_lat.insert(0, "22.804565") # Coordinates near Jamshedpur/Ranchi region
        self.entry_lat.pack()

        tk.Label(master, text="Longitude:", font=('Arial', 10, 'bold')).pack(pady=2)
        self.entry_lng = tk.Entry(master, width=30)
        self.entry_lng.insert(0, "86.202875")
        self.entry_lng.pack()

        # High-Priority Trigger Button
        self.btn_trigger = tk.Button(master, text="SIMULATE IMPACT / CRASH", 
                                     bg="red", fg="white", font=('Arial', 12, 'bold'),
                                     command=self.initiate_crash_pipeline)
        self.btn_trigger.pack(pady=20)

    def initiate_crash_pipeline(self):
        # Freeze entry inputs to preserve telemetry at exact point of impact
        payload = {
            "vehicle_id": self.entry_id.get(),
            "speed": float(self.entry_speed.get()),
            "latitude": float(self.entry_lat.get()),
            "longitude": float(self.entry_lng.get()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "impact_severity": "HIGH"
        }
        
        # Spawn asynchronous worker thread to transmit without locking the GUI mainloop
        threading.Thread(target=self.send_packet, args=(payload,)).start()

    def send_packet(self, payload):
        try:
            response = requests.post(self.server_url, json=payload, timeout=5)
            if response.status_code == 200:
                messagebox.showinfo("Success", "Telemetry package successfully routed via cloud network.")
            else:
                messagebox.showerror("Network Error", f"Server responded with status code: {response.status_code}")
        except Exception as e:
            messagebox.showerror("Fatal Error", f"Could not bridge connection to edge proxy: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = ResQNetSimulator(root)
    root.mainloop()