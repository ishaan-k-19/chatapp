import { useEffect, useState } from "react"; // Importing hooks from React
import toast from "react-hot-toast"; // Importing toast notifications

// Custom hook for handling errors
const useErrors = (errors = []) =>{

    useEffect(() => {
        // Iterates through all errors and handles them
        errors.forEach(({isError, error, fallback}) =>{
            if(isError){ // If there is an error
                if(fallback) fallback(); // If a fallback function exists, call it
                else toast.error(error?.data?.message || "Something went wrong"); // Show error message using toast
            }
        });
    }, [errors]); // Effect depends on the errors array
}

// Custom hook for handling asynchronous mutations
const useAsyncMutation = (mutationHook) => {

    // Local state to manage loading state and data
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);

    // Destructuring the mutation function from the provided hook
    const [mutate] = mutationHook();

    // Function to execute the mutation
    const executeMutation = async (toastMessage, ...args)=>{
        setIsLoading(true); // Set loading state to true
        const toastId = toast.loading(toastMessage || "Updating data..."); // Show loading toast

        try {
            const res = await mutate(...args); // Await the mutation result
            if(res.data){ // If the response contains data
              toast.success(res.data.message || "Updated data successfully", {id: toastId }); // Show success toast
              setData(res.data); // Set the data in the state
            } else{
              toast.error(res?.error?.data?.message || "Something went wrong", {id: toastId }) // Show error toast if no data
            }
        } catch (error) {
            toast.error("Something went wrong", {id: toastId }); // Catch any errors and show error toast
        } 
        finally{
            setIsLoading(false); // Set loading state to false when done
        }
    };

    return [executeMutation, isLoading, data]; // Return the mutation function, loading state, and data
};

// Custom hook for handling socket events
const useSocketEvents = (socket, handlers) =>{
  useEffect(() => {
    // Iterates over the handlers object and listens to each socket event
    Object.entries(handlers).forEach(([event, handler])=>{
      socket.on(event, handler); // Listen for the event with the handler
    });

    // Cleanup function to remove event listeners when the component unmounts or handlers change
    return (() => {
      Object.entries(handlers).forEach(([event, handler])=>{
        socket.off(event, handler); // Remove event listener
      })
    });
  }, [socket, handlers]); // Effect depends on socket and handlers
}

export { useErrors, useAsyncMutation, useSocketEvents }; // Export the custom hooks