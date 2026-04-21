import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../api/auth';
import { extractApiError } from '../api/client';
import {
  GENDER_OPTIONS,
  getCountryCodes,
  getProfile,
  submitOnboarding,
  type CountryCode,
  type Gender,
  type OnboardingIn,
  type ProfileOut,
} from '../api/profile';
import CountryCodeSelect from '../components/CountryCodeSelect';
import './Auth.css';
import './Onboarding.css';

const MAX_DOB = new Date().toISOString().slice(0, 10);

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<CountryCode[]>([]);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [bio, setBio] = useState('');
  const [dialCode, setDialCode] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [profile, codes] = await Promise.all([getProfile(), getCountryCodes()]);
        if (cancelled) return;
        if (profile.onboarding_completed) {
          navigate('/profile', { replace: true });
          return;
        }
        setCountries(codes);
        // Prefill from any existing (e.g., Google signup may populate name)
        if (profile.full_name) setFullName(profile.full_name);
        if (profile.date_of_birth) setDob(profile.date_of_birth);
        if (profile.gender) setGender(profile.gender);
        if (profile.bio) setBio(profile.bio);
        if (profile.phone_country_code) setDialCode(profile.phone_country_code);
        if (profile.phone_number) setPhone(profile.phone_number);
      } catch (err) {
        if (!cancelled) setError(extractApiError(err, 'Failed to load onboarding.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (fullName.trim().length > 128) {
      setError('Full name must be 128 characters or fewer.');
      return;
    }
    if (!dob) {
      setError('Date of birth is required.');
      return;
    }
    if (new Date(dob) >= new Date()) {
      setError('Date of birth must be in the past.');
      return;
    }
    if (!gender) {
      setError('Please select a gender option.');
      return;
    }
    if (bio.length > 500) {
      setError('Bio must be 500 characters or fewer.');
      return;
    }
    const trimmedPhone = phone.trim();
    const hasDial = !!dialCode;
    const hasPhone = !!trimmedPhone;
    if (hasDial !== hasPhone) {
      setError('Enter both country code and phone number, or leave both blank.');
      return;
    }

    const payload: OnboardingIn = {
      full_name: fullName.trim(),
      date_of_birth: dob,
      gender,
    };
    if (bio.trim()) payload.bio = bio.trim();
    if (hasDial && hasPhone) {
      payload.phone_country_code = dialCode;
      payload.phone_number = trimmedPhone;
    }

    setSubmitting(true);
    try {
      const updated: ProfileOut = await submitOnboarding(payload);
      if (updated.onboarding_completed) {
        navigate('/', { replace: true });
      } else {
        setError('Onboarding did not complete. Please try again.');
      }
    } catch (err) {
      setError(extractApiError(err, 'Onboarding failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p className="auth-subtitle">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-stars"></div>
      <div className="auth-card onboarding-card">
        <h1 className="auth-title">Tell us about you</h1>
        <p className="auth-subtitle">A few details to personalize your vCHITR space.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="full_name">Full name</label>
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ada Lovelace"
              maxLength={128}
              autoComplete="name"
              disabled={submitting}
            />
          </div>

          <div className="onboarding-row">
            <div className="auth-field">
              <label htmlFor="dob">Date of birth</label>
              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={MAX_DOB}
                disabled={submitting}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                disabled={submitting}
              >
                <option value="">Select…</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="bio">Bio (optional)</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A sentence about yourself…"
              rows={3}
              maxLength={500}
              disabled={submitting}
            />
            <span className="onboarding-counter">{bio.length}/500</span>
          </div>

          <div className="auth-field">
            <label htmlFor="phone_number">Phone (optional)</label>
            <div className="onboarding-phone">
              <CountryCodeSelect
                id="phone_country_code"
                countries={countries}
                value={dialCode}
                onChange={setDialCode}
                disabled={submitting}
                variant="dark"
                aria-label="Country code"
              />
              <input
                id="phone_number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                maxLength={32}
                autoComplete="tel-national"
                disabled={submitting}
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-btn auth-btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Finish setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
