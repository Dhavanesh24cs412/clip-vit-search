const API_BASE_URL = "http://127.0.0.1:8000";

export const getEvents = async () => {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
        throw new Error("Failed to fetch events");
    }
    return response.json();
};

export const searchSimilarImages = async (eventType, imageFile) => {
    const formData = new FormData();
    formData.append("event_type", eventType);
    formData.append("image", imageFile);

    const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Search request failed");
    }

    return response.json();
};

export const searchText = async (eventType, prompt) => {
    const response = await fetch(`${API_BASE_URL}/search/text`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            event_type: eventType,
            prompt: prompt
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Search request failed");
    }

    return response.json();
};

export const getImageUrl = (urlPath) => {
    if (!urlPath) return "";
    return `${API_BASE_URL}${urlPath}`;
};
