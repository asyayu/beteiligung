async function fetchAndDisplayStats() {
    try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)

        document.getElementById('averageAgeStat').textContent = data.average_age.average_age.toLocaleString('de-DE');
        // document.getElementById('percentageDresden').textContent = `${data.percentage_from_dresden.percentage_from_dresden}%`;
        // document.getElementById('percentWithPets').textContent = `${data.percentage_with_pet.percentage_with_pet}%`;
        document.getElementById('totalResponses').textContent = data.total_responses.total_responses;
        document.getElementById('percentParticipating').textContent = `${data.pc_participating.pc_participating.toLocaleString('de-DE')}%`;

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const paginationWrapper = document.querySelector(".pagination-wrapper");
    const nextBtn = document.querySelector(".nextBtn");
    const prevBtn = document.querySelector(".prevBtn");
    const form = document.getElementById("visitorForm");
    const offcanvasElement = document.getElementById("offcanvasExample");

    const progressBar = document.getElementById("formProgressBar");
    const currentStepText = document.getElementById("currentStep");

    let currentStep = 0;
    const totalSteps = 2;

    nextBtn.addEventListener("click", () => {
        currentStep = 1;
        updatePagination();
    });

    prevBtn.addEventListener("click", () => {
        currentStep = 0;
        updatePagination();
    });

    function updatePagination() {
        paginationWrapper.style.transform = `translateX(-${currentStep * 50}%)`;

        let progressPercentage = ((currentStep + 1) / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.textContent = `Schritt ${currentStep + 1} / ${totalSteps}`;

        currentStepText.textContent = currentStep + 1;
    }

    offcanvasElement.addEventListener("hidden.bs.offcanvas", () => {
        form.reset();
        $("#format").val([]).trigger("chosen:updated");
        currentStep = 0;
        updatePagination();
    });

    updatePagination();


});

let formSubmitting = false;

document.getElementById('visitorForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    if (formSubmitting) {
        return;
    }

    formSubmitting = true;

    const submitButton = this.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Wird gesendet...";
    }

    const alertBox = document.getElementById('alert');
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    data.channel = formData.getAll('channel[]');
    data.participationMode = formData.getAll('participationMode[]');
    data.futureReachMode = formData.getAll('futureReachMode[]');
    data.format = formData.getAll('format[]');

    let isValid = (
        (data.age && data.age.trim() !== "") ||
        (data.stadtbezirk && data.stadtbezirk.trim() !== "") ||
        data.channel.length > 0 ||
        data.participationMode.length > 0 ||
        data.futureReachMode.length > 0 ||
        data.format.length > 0 ||
        data.analogueOrDigital
    );

    if (!isValid) {
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.innerText = "Bitte füllen Sie mindestens ein Feld aus.";

            setTimeout(() => {
                alertBox.classList.add('hidden');
                setTimeout(() => {
                    alertBox.style.display = 'none';
                    alertBox.classList.remove('hidden');
                }, 500);
            }, 5000);
        }
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Absenden";
        }
        formSubmitting = false;
        return;
    }

    try {
        const response = await fetch('/new/visitor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error && alertBox) {
                alertBox.style.display = 'block';
                alertBox.innerText = errorData.error;
            } else {
                throw new Error('Failed to submit form');
            }
        } else {
            const offcanvasInstance = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasExample'));
            offcanvasInstance.hide();

            setTimeout(() => {
                $("#format").val([]).trigger("chosen:updated");
            }, 100);

            await updateGraphics();
            await fetchAndDisplayStats();
        }
    } catch (error) {
        console.error('Error:', error);
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.innerText = 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        }
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Absenden";
        }
        formSubmitting = false;
    }
});


$(document).ready(function () {
    $("#format").chosen({
        width: "100%",
        no_results_text: "Keine Ergebnisse gefunden",
        placeholder_text_multiple: "Option auswählen (Mehrauswahl möglich)",
    });
});

window.addEventListener('load', fetchAndDisplayStats);

