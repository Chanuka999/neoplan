import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router";

import {
  REDIRECT_DELAY_MS,
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
} from "../lib/constants";

const Upload = ({ onComplete }: { onComplete?: (base64: string) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { isSignedIn } = useOutletContext<AuthContext>();

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isSignedIn) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles[0]) {
      onChange({ target: { files: droppedFiles } } as any);
    }
  };

  // onChange handler for file input
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } },
  ) => {
    if (!isSignedIn) return;
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setProgress(0);
      processFile(files[0]);
    }
  };

  // processFile: reads file as base64, simulates progress, calls onComplete
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      let base64 = reader.result as string;
      let prog = 0;
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        prog += PROGRESS_STEP;
        if (prog >= 100) {
          prog = 100;
          setProgress(100);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => {
            if (onComplete) onComplete(base64);
          }, REDIRECT_DELAY_MS);
        } else {
          setProgress(prog);
        }
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(file);
  };

  // Clean up interval on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={onChange}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or just drag and drop"
                : "Sign in or sign up with puter to upload"}
            </p>
            <p className="help">Maximum file size 50 MB.</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>
            <h3>{file.name}</h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? "Analyzing Floor plan..." : "Redirecting..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
