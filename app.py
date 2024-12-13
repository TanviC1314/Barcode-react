import cv2

def scan_barcode():
    # Initialize the video capture for the default camera
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not access the camera.")
        return

    print("Scanning for barcodes. Press 'q' to quit.")

    # QR Code Detector
    qr_code_detector = cv2.QRCodeDetector()

    while True:
        ret, frame = cap.read()

        if not ret:
            print("Error: Failed to capture frame.")
            break

        # Detect and decode QR code
        data, points, _ = qr_code_detector.detectAndDecode(frame)

        if points is not None:
            # Draw bounding box around detected QR code
            points = points.astype(int).reshape(-1, 2)
            for i in range(len(points)):
                start_point = tuple(points[i])
                end_point = tuple(points[(i + 1) % len(points)])
                cv2.line(frame, start_point, end_point, color=(0, 255, 0), thickness=2)

            if data:
                # Display detected QR code data
                cv2.putText(frame, data, (points[0][0], points[0][1] - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
                print(f"Detected QR Code: {data}")

        # Display the frame
        cv2.imshow('Barcode Scanner', frame)

        # Break the loop on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the capture and close the window
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    scan_barcode()
