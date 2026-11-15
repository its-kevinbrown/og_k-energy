
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app-check.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// OG_K ENERGY Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBit7_vqjNHWpkLkaROWrL7L4YenLJ9eR8",
  authDomain: "og-k-energy.firebaseapp.com",
  projectId: "og-k-energy",
  storageBucket: "og-k-energy.firebasestorage.app",
  messagingSenderId: "826611000812",
  appId: "1:826611000812:web:66bf6eef7d5c3069068cc9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(
    "6Lci4SAuAAAAADu6BP115FA5zNnXlgdhNAgfPCHy"
  ),
  isTokenAutoRefreshEnabled: true
});

// Initialize Firestore
const db = getFirestore(app);

// Connect the contact form
const contactForm = document.getElementById("contactForm");
const successMessage = document.getElementById("success");
const submitButton = document.getElementById("sendMessageButton");

if (!contactForm || !successMessage || !submitButton) {
  console.error("Contact form, success message, or submit button was not found.");
} else {

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    const serviceSelect = contactForm.querySelector('select[name="service"]');
    const service = serviceSelect ? serviceSelect.value.trim() : "";

    const message = document.getElementById("message").value.trim();

    console.log("Selected service:", service);

    const missingFields = [];

    if (!name) missingFields.push("Full name");
    if (!email) missingFields.push("Email address");
    if (!phone) missingFields.push("Phone number");
    if (!service) missingFields.push("Service required");
    if (!message) missingFields.push("Project description");

    if (missingFields.length > 0) {
      successMessage.innerHTML =
        `<div class="alert alert-danger">
          Please complete: ${missingFields.join(", ")}
        </div>`;
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    successMessage.innerHTML = "";

    
try {
  // First, save the enquiry in Firebase
  await addDoc(collection(db, "enquiries"), {
    name,
    email,
    phone,
    service,
    message,
    createdAt: serverTimestamp()
  });

  // Then send the email notification
  let emailSent = false;

  try {
    const emailResponse = await fetch("/api/send-enquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        service,
        message
      })
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailResult.error || "Email notification failed");
    }

    emailSent = true;

    } catch (emailError) {
        console.error("Email notification error:", emailError);
    }

    if (emailSent) {
        successMessage.innerHTML =
        '<div class="alert alert-success">Thank you! Your enquiry has been received. Our team will contact you shortly.</div>';
    } else {
        successMessage.innerHTML =
        '<div class="alert alert-success">Your enquiry has been received successfully. Our team will contact you shortly.</div>';
    }

    contactForm.reset();

    } catch (error) {
    console.error("Firebase submission error:", error);

    successMessage.innerHTML =
        '<div class="alert alert-danger">Sorry, your enquiry could not be saved. Please try again.</div>';

    } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send Message";
    }

  });
}
