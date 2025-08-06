import React, { useEffect, useState } from "react";
import SummaryApi from "../common";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${SummaryApi.verifyEmail.url}?token=${token}`);
        const data = await res.json();

        if (data.success) {
          toast.success(data.message || "Email verified successfully!");
          setTimeout(() => navigate("/login"), 2500);
        } else {
          toast.error(data.message || "Invalid or expired token.");
        }
      } catch (err) {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (token) verify();
    else {
      toast.error("No token provided");
      setLoading(false);
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <p className="text-lg font-semibold animate-pulse">Verifying your email...</p>
      ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )}
    </div>
  );
};

export default VerifyEmail;
