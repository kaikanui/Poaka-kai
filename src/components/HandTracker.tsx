import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
  onHandUpdate: (landmarks: any[]) => void;
  isPaused?: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, isPaused }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const prevLandmarksRef = useRef<any[] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Smoothing factor (EMA). 0.1 = very smooth/slow, 0.9 = jerky/fast
  const SMOOTHING_FACTOR = 0.5;

  useEffect(() => {
    const initTracker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.7,
          minHandPresenceConfidence: 0.7,
          minTrackingConfidence: 0.7
        });
        
        setIsLoaded(true);
      } catch (err) {
        console.error("Tracker init error:", err);
        setError("Failed to initialize hand tracker. Please check your connection.");
      }
    };

    initTracker();

    return () => {
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: "user" 
        }
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", () => {
        predictWebcam();
      });
    } catch (err) {
      console.error("Camera error:", err);
      setError("Please enable camera access to play the game.");
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      startCamera();
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isLoaded, startCamera]);

  const smoothLandmarks = (newLandmarks: any[]) => {
    if (!prevLandmarksRef.current || prevLandmarksRef.current.length === 0) {
      prevLandmarksRef.current = newLandmarks;
      return newLandmarks;
    }

    const smoothed = newLandmarks.map((hand, handIdx) => {
      const prevHand = prevLandmarksRef.current![handIdx];
      if (!prevHand) return hand;

      return hand.map((landmark: any, i: number) => {
        const prevLandmark = prevHand[i];
        if (!prevLandmark) return landmark;

        return {
          x: prevLandmark.x + (landmark.x - prevLandmark.x) * SMOOTHING_FACTOR,
          y: prevLandmark.y + (landmark.y - prevLandmark.y) * SMOOTHING_FACTOR,
          z: prevLandmark.z + (landmark.z - prevLandmark.z) * SMOOTHING_FACTOR,
        };
      });
    });

    prevLandmarksRef.current = smoothed;
    return smoothed;
  };

  const predictWebcam = async () => {
    if (!videoRef.current || !landmarkerRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const startTimeMs = performance.now();
      const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      
      if (results.landmarks) {
        const smoothed = smoothLandmarks(results.landmarks);
        onHandUpdate(smoothed);
      } else {
        onHandUpdate([]);
      }
    }

    if (!isPaused) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-8 text-center z-50">
        <div className="max-w-md">
          <p className="text-xl font-bold mb-4">He raruraru (Error)</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-fill"
        style={{ transform: "scaleX(-1)" }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-art-bg/20 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-art-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-art-green animate-pulse">E whakarite ana (Initializing)...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandTracker;
