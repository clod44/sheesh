document.addEventListener("DOMContentLoaded", function () {


    const btnNavbarGlobal = document.getElementById("btn-navbar-global")
    function loopFunction() {
        updateOnlineCount(btnNavbarGlobal)
        setTimeout(loopFunction, 5000);
    }
    loopFunction()


    
    updateSessionToken();

    async function updateProfile() {
        try {
            const response = await fetch('/api/profile');
            const data = await response.json();
            console.log(data);
            if (data.success) {
                const usernameInput = document.getElementById('username');
                const passwordInput = document.getElementById('password');
                const profileImage = document.getElementById("profile-image")
                if (data.data.profilePicture) {
                    profileImage.src = "/pfp/" + data.data.profilePicture
                }
                usernameInput.value = data.data.username;
                passwordInput.value = data.data.password;
            } else {
                // Redirect to the login page
                window.location.href = "/login";
            }
        } catch (error) {
            console.error(error);
        }
    }

    updateProfile();

    document.getElementById("logout-button").addEventListener("click", async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log(data);

            // Update profile formölöm
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            // Clear the input values
            usernameInput.value = "";
            passwordInput.value = "";

            // Redirect to the login page
            window.location.href = "/login";
        } catch (error) {
            console.error(error);
        }
    });





    // Handle form submission
    const btnUpload = document.getElementById
    const handleFormSubmit = async (event) => {
        event.preventDefault();

        try {
            const profileForm = document.getElementById('profile-form');
            const submitButton = profileForm.querySelector('button[type="submit"]');
            submitButton.disabled = true
            const imageInput = document.getElementById('image-input');
            const selectedFile = imageInput.files[0];
            const profileImage = document.getElementById('profile-image');

            // Convert the selected file to a data URL
            const reader = new FileReader();
            reader.onload = async (event) => {
                const originalImage = event.target.result;

                // Compress and resize the image
                const compressedImage = await compressAndResizeImage(originalImage, 128, 128);
                profileImage.src = compressedImage;

                // Create a new FormData object
                const formData = new FormData();
                const compressedBlob = dataURLtoBlob(compressedImage);
                formData.append('pfp', compressedBlob, 'image.jpg');
                formData.append('username', profileForm.elements.username.value);
                formData.append('password', profileForm.elements.password.value);

                // Send the FormData in the POST request
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                console.log(data);
                
                setTimeout(() => {
                    submitButton.disabled = false;
                }, 5000);
            };

            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error(error);
        }
    };

    // Attach the event listener to the form submit button
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', handleFormSubmit);





    // Handle image selection
    const handleImageSelection = async (event) => {
        const selectedFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                clog("compressiong image now...")
                const compressedImage = await compressAndResizeImage(
                    event.target.result, // Pass the data URL directly
                    128,
                    128
                );
                clog("done")
                profileImage.src = compressedImage;
            } catch (error) {
                console.error(error);
            }
        };
        reader.readAsDataURL(selectedFile);
    };

    // Attach the event listeners
    const imageInput = document.getElementById('image-input');
    const profileImage = document.getElementById('profile-image');

    profileImage.addEventListener('click', openFilePicker);

    function openFilePicker() {
        imageInput.click();
    }

    imageInput.addEventListener('change', handleImageSelection);

});
