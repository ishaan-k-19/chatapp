import moment from "moment";

// Function to determine the file format based on the file extension in the URL
const fileFormat = (url = "") => {
    // Extract the file extension from the URL
    const fileExt = url.split(".").pop();

    // Check for video formats
    if (fileExt === "mp4" || fileExt === "webm" || fileExt === "ogg")
        return "video"; // Return "video" if the file is a video

    // Check for audio formats
    if (fileExt === "mp3" || fileExt === "wav")
        return "audio"; // Return "audio" if the file is an audio file

    // Check for image formats
    if (fileExt === "png" || fileExt === "jpg" || fileExt === "jpeg" || fileExt === "gif")
        return "image"; // Return "image" if the file is an image

    // Return "file" for any other file type
    return "file"; 
};

// Function to transform image URL by modifying the width
const transformImage = (url = "", width = 100) => {
    // Replace the "upload/" part in the URL with a modified version that includes width and auto DPR
    const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`);

    // Return the transformed URL
    return newUrl;
};

// Function to either retrieve or save data to local storage
const getOrSaveFromStorage = ({ key, value, get }) => {
    // If "get" is true, attempt to retrieve the item from localStorage
    if (get)
        return localStorage.getItem(key) 
            ? JSON.parse(localStorage.getItem(key)) // Parse and return the stored value if found
            : null; // Return null if no value is found in localStorage
    else 
        // Otherwise, save the value to localStorage by stringifying it
        localStorage.setItem(key, JSON.stringify(value));
};

// Function to get the last 7 days as an array of day names
const getLast7Days = () => {
    const currentDate = moment(); // Get the current date using moment

    const last7Days = []; // Array to store the day names for the last 7 days

    // Loop through the last 7 days and get the corresponding day names
    for (let i = 0; i < 7; i++) {
        const dayDate = currentDate.clone().subtract(i, "days"); // Get the date for the day i days ago
        const dayName = dayDate.format("dddd"); // Get the full day name (e.g., "Monday")

        last7Days.unshift(dayName); // Add the day name to the front of the array
    }

    // Return the array of day names for the last 7 days
    return last7Days;
};


export { fileFormat, transformImage, getOrSaveFromStorage, getLast7Days }