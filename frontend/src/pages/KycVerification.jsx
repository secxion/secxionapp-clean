import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCamera,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUpload,
} from 'react-icons/fa';
import SummaryApi from '../common';
import uploadImage from '../helpers/uploadImage';

const emptyForm = {
  fullName: '',
  dateOfBirth: '',
  country: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateProvince: '',
  postalCode: '',
  consentAccepted: false,
  idType: 'national_id',
  idNumber: '',
  frontUrl: '',
  backUrl: '',
  selfieUrl: '',
};

const COUNTRY_OPTIONS = [
  'Afghanistan',
  'Algeria',
  'Argentina',
  'Australia',
  'Austria',
  'Bangladesh',
  'Belgium',
  'Brazil',
  'Cameroon',
  'Canada',
  'China',
  'Colombia',
  "Cote d'Ivoire",
  'Denmark',
  'Egypt',
  'Ethiopia',
  'Finland',
  'France',
  'Germany',
  'Ghana',
  'Greece',
  'India',
  'Indonesia',
  'Ireland',
  'Israel',
  'Italy',
  'Japan',
  'Kenya',
  'Malaysia',
  'Mexico',
  'Morocco',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'Norway',
  'Pakistan',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Rwanda',
  'Saudi Arabia',
  'Senegal',
  'Singapore',
  'South Africa',
  'South Korea',
  'Spain',
  'Sweden',
  'Switzerland',
  'Tanzania',
  'Thailand',
  'Tunisia',
  'Turkey',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Vietnam',
  'Zambia',
  'Zimbabwe',
];

const COUNTRY_DIAL_CODES = {
  Afghanistan: '+93',
  Algeria: '+213',
  Argentina: '+54',
  Australia: '+61',
  Austria: '+43',
  Bangladesh: '+880',
  Belgium: '+32',
  Brazil: '+55',
  Cameroon: '+237',
  Canada: '+1',
  China: '+86',
  Colombia: '+57',
  "Cote d'Ivoire": '+225',
  Denmark: '+45',
  Egypt: '+20',
  Ethiopia: '+251',
  Finland: '+358',
  France: '+33',
  Germany: '+49',
  Ghana: '+233',
  Greece: '+30',
  India: '+91',
  Indonesia: '+62',
  Ireland: '+353',
  Israel: '+972',
  Italy: '+39',
  Japan: '+81',
  Kenya: '+254',
  Malaysia: '+60',
  Mexico: '+52',
  Morocco: '+212',
  Netherlands: '+31',
  'New Zealand': '+64',
  Nigeria: '+234',
  Norway: '+47',
  Pakistan: '+92',
  Philippines: '+63',
  Poland: '+48',
  Portugal: '+351',
  Qatar: '+974',
  Romania: '+40',
  Rwanda: '+250',
  'Saudi Arabia': '+966',
  Senegal: '+221',
  Singapore: '+65',
  'South Africa': '+27',
  'South Korea': '+82',
  Spain: '+34',
  Sweden: '+46',
  Switzerland: '+41',
  Tanzania: '+255',
  Thailand: '+66',
  Tunisia: '+216',
  Turkey: '+90',
  Uganda: '+256',
  Ukraine: '+380',
  'United Arab Emirates': '+971',
  'United Kingdom': '+44',
  'United States': '+1',
  Vietnam: '+84',
  Zambia: '+260',
  Zimbabwe: '+263',
};

const normalizeAddressPart = (value = '') => String(value).trim();

const parseAddressString = (address = '') => {
  const parsed = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
  };

  if (!address) return parsed;

  const parts = String(address)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const streetParts = [];

  parts.forEach((part) => {
    const lower = part.toLowerCase();

    if (lower.startsWith('city:')) {
      parsed.city = part.slice(5).trim();
      return;
    }

    if (lower.startsWith('state/province:')) {
      parsed.stateProvince = part.slice(15).trim();
      return;
    }

    if (lower.startsWith('postal code:')) {
      parsed.postalCode = part.slice(12).trim();
      return;
    }

    streetParts.push(part);
  });

  parsed.addressLine1 = streetParts[0] || '';
  parsed.addressLine2 = streetParts.slice(1).join(', ');

  return parsed;
};

const buildAddressString = ({
  addressLine1,
  addressLine2,
  city,
  stateProvince,
  postalCode,
}) => {
  const line1 = normalizeAddressPart(addressLine1);
  const line2 = normalizeAddressPart(addressLine2);
  const cityValue = normalizeAddressPart(city);
  const stateValue = normalizeAddressPart(stateProvince);
  const postalValue = normalizeAddressPart(postalCode);

  return [
    line1,
    line2,
    cityValue ? `City: ${cityValue}` : '',
    stateValue ? `State/Province: ${stateValue}` : '',
    postalValue ? `Postal Code: ${postalValue}` : '',
  ]
    .filter(Boolean)
    .join(', ');
};

const withCountryDialCode = (currentPhone, previousCountry, nextCountry) => {
  const current = String(currentPhone || '').trim();
  const previousCode = COUNTRY_DIAL_CODES[previousCountry] || '';
  const nextCode = COUNTRY_DIAL_CODES[nextCountry] || '';

  if (!nextCode) return current;
  if (!current) return `${nextCode}`;
  if (previousCode && current.startsWith(previousCode)) {
    return `${nextCode}${current.slice(previousCode.length)}`;
  }

  if (!current.startsWith('+')) {
    return `${nextCode}${current}`;
  }

  return current;
};

const buildPhoneWithDialCode = (country, localNumber) => {
  const dialCode = COUNTRY_DIAL_CODES[country] || '';
  const sanitizedLocal = String(localNumber || '').replace(/\D/g, '');
  const normalizedLocal = sanitizedLocal.replace(/^0+/, '');

  if (!dialCode) return String(localNumber || '').trim();
  if (!normalizedLocal) return dialCode;

  return `${dialCode}${normalizedLocal}`;
};

const extractLocalNumber = (country, fullPhoneNumber) => {
  const dialCode = COUNTRY_DIAL_CODES[country] || '';
  const normalized = String(fullPhoneNumber || '').trim();

  if (!normalized) return '';
  if (dialCode && normalized.startsWith(dialCode)) {
    return normalized.slice(dialCode.length).replace(/\D/g, '');
  }

  return normalized.replace(/\D/g, '');
};

const statusConfig = {
  unverified: {
    label: 'Not Submitted',
    className: 'bg-slate-700/40 text-slate-200 border-slate-500/50',
    icon: FaClock,
  },
  pending: {
    label: 'Pending Review',
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    icon: FaClock,
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-500/20 text-green-300 border-green-500/40',
    icon: FaCheckCircle,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/20 text-red-300 border-red-500/40',
    icon: FaTimesCircle,
  },
};

const faceMatchLabel = {
  not_started: 'Not Started',
  pending: 'Pending Review',
  passed: 'Passed',
  failed: 'Failed',
};

const KycVerification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({
    front: false,
    back: false,
    selfie: false,
  });
  const [kycData, setKycData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerification, setPhoneVerification] = useState({
    sending: false,
    verifying: false,
    isVerified: false,
    verifiedAt: null,
  });
  const [selfieCapturedAt, setSelfieCapturedAt] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const status = useMemo(() => {
    if (!kycData) return 'unverified';
    return kycData.status || 'unverified';
  }, [kycData]);

  const canSubmit = status !== 'pending' && status !== 'approved';

  const loadKyc = async () => {
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.getMyKyc.url, {
        method: SummaryApi.getMyKyc.method,
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch KYC data.');
      }

      setKycData(result.data);

      if (result.data) {
        const parsedAddress = parseAddressString(result.data.address || '');
        const countryValue = result.data.country || '';

        setForm({
          fullName: result.data.fullName || '',
          dateOfBirth: result.data.dateOfBirth
            ? new Date(result.data.dateOfBirth).toISOString().split('T')[0]
            : '',
          country: countryValue,
          phoneNumber: extractLocalNumber(
            countryValue,
            result.data.phoneNumber || '',
          ),
          addressLine1: parsedAddress.addressLine1,
          addressLine2: parsedAddress.addressLine2,
          city: parsedAddress.city,
          stateProvince: parsedAddress.stateProvince,
          postalCode: parsedAddress.postalCode,
          consentAccepted: Boolean(result.data.consent?.accepted),
          idType: result.data.idType || 'national_id',
          idNumber: result.data.idNumber || '',
          frontUrl: result.data.documents?.frontUrl || '',
          backUrl: result.data.documents?.backUrl || '',
          selfieUrl: result.data.documents?.selfieUrl || '',
        });

        setPhoneVerification((prev) => ({
          ...prev,
          isVerified: Boolean(result.data.phoneVerification?.isVerified),
          verifiedAt: result.data.phoneVerification?.verifiedAt || null,
        }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load KYC status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKyc();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === 'country') {
      setForm((prev) => ({
        ...prev,
        country: value,
        phoneNumber: extractLocalNumber(
          value,
          withCountryDialCode(prev.phoneNumber, prev.country, value),
        ),
      }));
      return;
    }

    if (name === 'phoneNumber') {
      setPhoneVerification((prev) => ({
        ...prev,
        isVerified: false,
        verifiedAt: null,
      }));
      setPhoneOtp('');
    }

    if (name === 'phoneNumber') {
      setForm((prev) => ({
        ...prev,
        phoneNumber: String(value || '').replace(/\D/g, ''),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const sendPhoneCode = async () => {
    const fullPhoneNumber = buildPhoneWithDialCode(
      form.country,
      form.phoneNumber,
    );

    if (!form.country) {
      toast.error('Select country before requesting a verification code.');
      return;
    }

    if (!form.phoneNumber.trim()) {
      toast.error(
        'Enter your phone number before requesting a verification code.',
      );
      return;
    }

    setPhoneVerification((prev) => ({ ...prev, sending: true }));

    try {
      const response = await fetch(SummaryApi.sendKycPhoneCode.url, {
        method: SummaryApi.sendKycPhoneCode.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to send phone verification code.',
        );
      }

      if (result.fallback && result.debugCode) {
        setPhoneOtp(String(result.debugCode));
        toast.info(`DEV fallback code: ${result.debugCode}`);
      }

      toast.success(result.message || 'Verification code sent.');
    } catch (error) {
      toast.error(error.message || 'Failed to send verification code.');
    } finally {
      setPhoneVerification((prev) => ({ ...prev, sending: false }));
    }
  };

  const verifyPhoneCode = async () => {
    const fullPhoneNumber = buildPhoneWithDialCode(
      form.country,
      form.phoneNumber,
    );

    if (!form.phoneNumber.trim() || !phoneOtp.trim()) {
      toast.error('Phone number and verification code are required.');
      return;
    }

    setPhoneVerification((prev) => ({ ...prev, verifying: true }));

    try {
      const response = await fetch(SummaryApi.verifyKycPhoneCode.url, {
        method: SummaryApi.verifyKycPhoneCode.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          otp: phoneOtp,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Phone verification failed.');
      }

      setPhoneVerification({
        sending: false,
        verifying: false,
        isVerified: true,
        verifiedAt: result.data?.verifiedAt || new Date().toISOString(),
      });
      toast.success(result.message || 'Phone verified successfully.');
    } catch (error) {
      setPhoneVerification((prev) => ({ ...prev, isVerified: false }));
      toast.error(error.message || 'Phone verification failed.');
    } finally {
      setPhoneVerification((prev) => ({ ...prev, verifying: false }));
    }
  };

  const handleUpload = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [field]: true }));

    try {
      const uploaded = await uploadImage(file);
      if (!uploaded?.url) {
        throw new Error(uploaded?.error || 'Image upload failed.');
      }

      setForm((prev) => ({ ...prev, [`${field}Url`]: uploaded.url }));
      toast.success('Image uploaded successfully.');
    } catch (error) {
      toast.error(error.message || 'Upload failed.');
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const openCamera = async () => {
    setCameraError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported on this browser/device.');
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {
            setCameraError('Unable to start camera preview.');
          });
        }
      });
    } catch (error) {
      setCameraError(
        'Unable to access camera. Please allow camera permission and try again.',
      );
    }
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    stopCamera();
  };

  const captureSelfie = async () => {
    if (!videoRef.current) {
      toast.error('Camera preview is not ready.');
      return;
    }

    const video = videoRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      toast.error('Could not capture image. Please try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);

    setUploading((prev) => ({ ...prev, selfie: true }));

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setUploading((prev) => ({ ...prev, selfie: false }));
          toast.error('Capture failed. Please try again.');
          return;
        }

        try {
          const selfieFile = new File([blob], 'kyc-selfie.jpg', {
            type: 'image/jpeg',
          });
          const uploaded = await uploadImage(selfieFile);
          if (!uploaded?.url) {
            throw new Error(uploaded?.error || 'Selfie upload failed.');
          }

          setForm((prev) => ({ ...prev, selfieUrl: uploaded.url }));
          setSelfieCapturedAt(new Date().toISOString());
          toast.success('Selfie captured and uploaded successfully.');
          closeCamera();
        } catch (error) {
          toast.error(error.message || 'Selfie upload failed.');
        } finally {
          setUploading((prev) => ({ ...prev, selfie: false }));
        }
      },
      'image/jpeg',
      0.9,
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    try {
      const response = await fetch(SummaryApi.submitKyc.url, {
        method: SummaryApi.submitKyc.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth,
          country: form.country,
          phoneNumber: buildPhoneWithDialCode(form.country, form.phoneNumber),
          address: buildAddressString(form),
          consent: {
            accepted: Boolean(form.consentAccepted),
            acceptedAt: form.consentAccepted ? new Date().toISOString() : null,
          },
          idType: form.idType,
          idNumber: form.idNumber,
          documents: {
            frontUrl: form.frontUrl,
            backUrl: form.backUrl,
            selfieUrl: form.selfieUrl,
            selfieCaptureMethod: 'live_camera',
            selfieCapturedAt,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit KYC.');
      }

      toast.success(result.message || 'KYC submitted successfully.');
      await loadKyc();
    } catch (error) {
      toast.error(error.message || 'KYC submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusUI = statusConfig[status] || statusConfig.unverified;
  const StatusIcon = statusUI.icon;

  return (
    <div className="mt-20 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">KYC Verification</h1>
            <p className="text-slate-400 text-sm mt-1">
              Submit your identity details for account verification.
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Back to Profile
          </button>
        </div>

        <div
          className={`mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusUI.className}`}
        >
          <StatusIcon />
          <span className="font-medium">Status: {statusUI.label}</span>
        </div>

        {kycData?.faceMatch && (
          <div className="mb-6 p-4 rounded-xl border border-slate-700 bg-slate-800/40">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Face Match Verification
            </p>
            <p className="mt-1 text-sm text-slate-200">
              Status:{' '}
              {faceMatchLabel[kycData.faceMatch.status] ||
                faceMatchLabel.not_started}
              {Number.isFinite(kycData.faceMatch.score)
                ? ` (${kycData.faceMatch.score.toFixed(2)}%)`
                : ''}
            </p>
            {kycData.faceMatch.checkedAt && (
              <p className="text-xs text-slate-400 mt-1">
                Last checked:{' '}
                {new Date(kycData.faceMatch.checkedAt).toLocaleString()}
              </p>
            )}
            {kycData.faceMatch.notes && (
              <p className="text-xs text-slate-300 mt-2">
                Notes: {kycData.faceMatch.notes}
              </p>
            )}
          </div>
        )}

        {kycData?.status === 'rejected' && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-200">
            <p className="font-semibold">Rejection Reason</p>
            <p className="mt-1 text-sm">
              {kycData.rejectionReason || 'No reason provided.'}
            </p>
            {kycData.adminNotes && (
              <p className="mt-2 text-sm text-red-100">
                Admin Notes: {kycData.adminNotes}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Full Name
              </span>
              <input
                id="kyc-full-name"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full legal name"
                required
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Date of Birth
              </span>
              <input
                id="kyc-date-of-birth"
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Country
              </span>
              <select
                id="kyc-country"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              >
                <option value="">Select Country</option>
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-800/30 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-300">
                Phone Number Verification
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-400">
                    Country Code
                  </span>
                  <input
                    type="text"
                    value={
                      form.country && COUNTRY_DIAL_CODES[form.country]
                        ? COUNTRY_DIAL_CODES[form.country]
                        : ''
                    }
                    disabled
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 outline-none"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs text-slate-400">
                    Phone Number
                  </span>
                  <input
                    id="kyc-phone-number"
                    type="text"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder={
                      form.country && COUNTRY_DIAL_CODES[form.country]
                        ? 'Enter number without country code'
                        : 'Select country first'
                    }
                    required
                    disabled={!canSubmit || loading || !form.country}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
                  />
                </label>
                <button
                  type="button"
                  disabled={
                    !canSubmit ||
                    loading ||
                    phoneVerification.sending ||
                    !form.country ||
                    !form.phoneNumber.trim()
                  }
                  onClick={sendPhoneCode}
                  className="self-end px-4 py-3 rounded-lg bg-yellow-500 text-slate-900 font-semibold hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {phoneVerification.sending ? 'Sending...' : 'Send Code'}
                </button>

                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs text-slate-400">
                    Verification Code
                  </span>
                  <input
                    id="kyc-phone-otp"
                    type="text"
                    value={phoneOtp}
                    onChange={(event) => setPhoneOtp(event.target.value)}
                    placeholder="Enter 6-digit code"
                    disabled={
                      !canSubmit || loading || phoneVerification.isVerified
                    }
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
                  />
                </label>
                <button
                  type="button"
                  disabled={
                    !canSubmit ||
                    loading ||
                    phoneVerification.verifying ||
                    phoneVerification.isVerified ||
                    !phoneOtp.trim()
                  }
                  onClick={verifyPhoneCode}
                  className="self-end px-4 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {phoneVerification.verifying
                    ? 'Verifying...'
                    : 'Verify Phone'}
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                {phoneVerification.isVerified
                  ? `Phone verified${phoneVerification.verifiedAt ? ` on ${new Date(phoneVerification.verifiedAt).toLocaleString()}` : ''}.`
                  : 'A live SMS OTP verification is required before KYC submission.'}
              </p>
            </div>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Street Address Line 1
              </span>
              <input
                id="kyc-address-line-1"
                type="text"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="House number and street"
                required
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Street Address Line 2
              </span>
              <input
                id="kyc-address-line-2"
                type="text"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, building (optional)"
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                City
              </span>
              <input
                id="kyc-city"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                State / Province
              </span>
              <input
                id="kyc-state"
                type="text"
                name="stateProvince"
                value={form.stateProvince}
                onChange={handleChange}
                placeholder="Enter state or province"
                required
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Postal Code
              </span>
              <input
                id="kyc-postal-code"
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
                required
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                ID Type
              </span>
              <select
                id="kyc-id-type"
                name="idType"
                value={form.idType}
                onChange={handleChange}
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              >
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="voters_card">Voter's Card</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                ID Number
              </span>
              <input
                id="kyc-id-number"
                type="text"
                name="idNumber"
                value={form.idNumber}
                onChange={handleChange}
                placeholder="Enter your ID number"
                required
                disabled={!canSubmit || loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-yellow-500 outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                key: 'front',
                label: 'ID Front (Required)',
                value: form.frontUrl,
              },
              { key: 'back', label: 'ID Back (Optional)', value: form.backUrl },
            ].map((item) => (
              <label
                key={item.key}
                className="block border border-dashed border-slate-600 rounded-xl p-4 bg-slate-800/50"
              >
                <p className="text-sm text-slate-300 mb-3">{item.label}</p>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!canSubmit || loading || uploading[item.key]}
                  onChange={(event) => handleUpload(event, item.key)}
                  className="hidden"
                  id={`kyc-${item.key}`}
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 truncate">
                    {item.value ? 'Uploaded' : 'No file selected'}
                  </span>
                  <label
                    htmlFor={`kyc-${item.key}`}
                    className="cursor-pointer px-3 py-2 text-xs rounded-lg bg-yellow-500 text-slate-900 font-semibold hover:bg-yellow-400 transition-colors"
                  >
                    {uploading[item.key] ? (
                      'Uploading...'
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <FaUpload /> Upload
                      </span>
                    )}
                  </label>
                </div>
                {item.value && (
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-yellow-400 hover:underline"
                  >
                    View uploaded file
                  </a>
                )}
              </label>
            ))}

            <div className="block border border-dashed border-slate-600 rounded-xl p-4 bg-slate-800/50">
              <p className="text-sm text-slate-300 mb-3">
                Selfie with ID (Required)
              </p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400 truncate">
                  {form.selfieUrl
                    ? 'Captured and uploaded'
                    : 'No selfie captured'}
                </span>
                <button
                  type="button"
                  disabled={!canSubmit || loading || uploading.selfie}
                  onClick={openCamera}
                  className="px-3 py-2 text-xs rounded-lg bg-yellow-500 text-slate-900 font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  <FaCamera /> {form.selfieUrl ? 'Retake' : 'Open Camera'}
                </button>
              </div>
              {form.selfieUrl && (
                <a
                  href={form.selfieUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-yellow-400 hover:underline"
                >
                  View captured selfie
                </a>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Live camera capture is required for selfie verification.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
            <input
              id="kyc-consent"
              type="checkbox"
              name="consentAccepted"
              checked={Boolean(form.consentAccepted)}
              onChange={handleChange}
              disabled={!canSubmit || loading}
              className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
            />
            <span className="text-sm text-slate-200 leading-6">
              I confirm that all KYC details and uploaded documents are accurate
              and belong to me, and I agree to verification checks for
              compliance and fraud prevention.
            </span>
          </label>

          <button
            type="submit"
            disabled={
              !canSubmit ||
              submitting ||
              loading ||
              !phoneVerification.isVerified ||
              !form.consentAccepted ||
              !form.frontUrl ||
              !form.selfieUrl
            }
            className="w-full md:w-auto px-6 py-3 rounded-lg bg-yellow-500 text-slate-900 font-bold hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? 'Submitting...'
              : kycData?.status === 'rejected'
                ? 'Resubmit KYC'
                : 'Submit KYC'}
          </button>

          {!canSubmit && (
            <p className="text-sm text-slate-400">
              KYC editing is disabled while your status is{' '}
              {statusUI.label.toLowerCase()}.
            </p>
          )}
        </form>

        {isCameraOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-white mb-3">
                Live Selfie Capture
              </h2>

              {cameraError && (
                <p className="mb-3 text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-lg p-3">
                  {cameraError}
                </p>
              )}

              <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-[320px] object-cover"
                />
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Position your face and ID clearly in frame, then capture.
              </p>

              <div className="mt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={uploading.selfie}
                  onClick={captureSelfie}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-slate-900 font-semibold hover:bg-yellow-400 disabled:opacity-60"
                >
                  {uploading.selfie ? 'Processing...' : 'Capture Selfie'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycVerification;
