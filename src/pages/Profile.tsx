import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, logout } from '../api/auth';
import { extractApiError } from '../api/client';
import {
  avatarSrc,
  deleteAvatar,
  GENDER_OPTIONS,
  getCountryCodes,
  getProfile,
  patchProfile,
  uploadAvatar,
  type CountryCode,
  type Gender,
  type ProfileOut,
  type ProfileUpdate,
} from '../api/profile';
import CountryCodeSelect from '../components/CountryCodeSelect';
import './Profile.css';

const MAX_DOB = new Date().toISOString().slice(0, 10);
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_MIME = ['image/png', 'image/jpeg', 'image/webp'];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  // Form state (populated from profile when edit starts)
  const [username, setUsername] = useState('');
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
        const [p, codes] = await Promise.all([getProfile(), getCountryCodes()]);
        if (cancelled) return;
        if (!p.onboarding_completed) {
          navigate('/onboarding', { replace: true });
          return;
        }
        setProfile(p);
        setCountries(codes);
      } catch (err) {
        if (!cancelled) setError(extractApiError(err, 'Failed to load profile.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const startEdit = () => {
    if (!profile) return;
    setUsername(profile.username);
    setFullName(profile.full_name ?? '');
    setDob(profile.date_of_birth ?? '');
    setGender(profile.gender ?? '');
    setBio(profile.bio ?? '');
    setDialCode(profile.phone_country_code ?? '');
    setPhone(profile.phone_number ?? '');
    setError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError('');

    const patch: ProfileUpdate = {};
    const trimmedUsername = username.trim();
    if (trimmedUsername !== profile.username) {
      if (trimmedUsername.length < 3 || trimmedUsername.length > 64) {
        setError('Username must be 3–64 characters.');
        return;
      }
      patch.username = trimmedUsername;
    }
    const trimmedFullName = fullName.trim();
    if (trimmedFullName !== (profile.full_name ?? '')) {
      patch.full_name = trimmedFullName;
    }
    if (dob !== (profile.date_of_birth ?? '')) {
      if (dob && new Date(dob) >= new Date()) {
        setError('Date of birth must be in the past.');
        return;
      }
      patch.date_of_birth = dob;
    }
    if (gender !== (profile.gender ?? '')) {
      if (!gender) {
        setError('Please select a gender option.');
        return;
      }
      patch.gender = gender;
    }
    if (bio !== (profile.bio ?? '')) {
      if (bio.length > 500) {
        setError('Bio must be 500 characters or fewer.');
        return;
      }
      patch.bio = bio;
    }

    const trimmedPhone = phone.trim();
    const phoneChanged =
      trimmedPhone !== (profile.phone_number ?? '') ||
      dialCode !== (profile.phone_country_code ?? '');
    if (phoneChanged) {
      const hasDial = !!dialCode;
      const hasPhone = !!trimmedPhone;
      if (hasDial !== hasPhone) {
        setError('Enter both country code and phone number, or leave both blank.');
        return;
      }
      patch.phone_country_code = hasDial ? dialCode : '';
      patch.phone_number = hasPhone ? trimmedPhone : '';
    }

    if (Object.keys(patch).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const updated = await patchProfile(patch);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setError(extractApiError(err, 'Failed to save profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPick = () => fileRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (!AVATAR_MIME.includes(file.type)) {
      setError('Avatar must be PNG, JPEG, or WebP.');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError('Avatar must be 2 MB or smaller.');
      return;
    }
    setAvatarBusy(true);
    try {
      const updated = await uploadAvatar(file);
      setProfile(updated);
    } catch (err) {
      setError(extractApiError(err, 'Avatar upload failed.'));
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!profile?.avatar_url) return;
    setError('');
    setAvatarBusy(true);
    try {
      const updated = await deleteAvatar();
      setProfile(updated);
    } catch (err) {
      setError(extractApiError(err, 'Failed to remove avatar.'));
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-error">{error || 'Profile unavailable.'}</p>
        </div>
      </div>
    );
  }

  const avatarUrl = avatarSrc(profile);

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            {avatarUrl ? (
              <img
                className="profile-avatar-img"
                src={avatarUrl}
                alt={profile.full_name ?? profile.username}
              />
            ) : (
              <div className="profile-avatar-initials" aria-hidden="true">
                {profile.initials}
              </div>
            )}
            <div className="profile-avatar-actions">
              <button
                type="button"
                className="profile-btn profile-btn-ghost profile-btn-sm"
                onClick={handleAvatarPick}
                disabled={avatarBusy}
              >
                {avatarBusy ? 'Working…' : avatarUrl ? 'Change' : 'Upload'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  className="profile-btn profile-btn-ghost profile-btn-sm"
                  onClick={handleAvatarDelete}
                  disabled={avatarBusy}
                >
                  Remove
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept={AVATAR_MIME.join(',')}
                onChange={handleAvatarChange}
                hidden
              />
            </div>
          </div>
          <div className="profile-header-text">
            <h1 className="profile-name">{profile.full_name || profile.username}</h1>
            <p className="profile-handle">@{profile.username}</p>
            <p className="profile-email">{profile.email}</p>
          </div>
          <div className="profile-header-actions">
            {!editing && (
              <button
                type="button"
                className="profile-btn profile-btn-solid"
                onClick={startEdit}
              >
                Edit
              </button>
            )}
            <button
              type="button"
              className="profile-btn profile-btn-ghost"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>

        {error && <p className="profile-error">{error}</p>}

        {editing ? (
          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-field">
              <label htmlFor="p_username">Username</label>
              <input
                id="p_username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={64}
                disabled={saving}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="p_full_name">Full name</label>
              <input
                id="p_full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={128}
                disabled={saving}
              />
            </div>

            <div className="profile-grid-2">
              <div className="profile-field">
                <label htmlFor="p_dob">Date of birth</label>
                <input
                  id="p_dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={MAX_DOB}
                  disabled={saving}
                />
              </div>
              <div className="profile-field">
                <label htmlFor="p_gender">Gender</label>
                <select
                  id="p_gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  disabled={saving}
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

            <div className="profile-field">
              <label htmlFor="p_bio">Bio</label>
              <textarea
                id="p_bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                disabled={saving}
              />
              <span className="profile-counter">{bio.length}/500</span>
            </div>

            <div className="profile-field">
              <label htmlFor="p_phone">Phone</label>
              <div className="profile-phone">
                <CountryCodeSelect
                  id="p_dial"
                  countries={countries}
                  value={dialCode}
                  onChange={setDialCode}
                  disabled={saving}
                  variant="profile"
                  aria-label="Country code"
                />
                <input
                  id="p_phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={32}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-btn profile-btn-ghost"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-btn profile-btn-solid"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        ) : (
          <dl className="profile-details">
            <div className="profile-detail">
              <dt>Full name</dt>
              <dd>{profile.full_name || '—'}</dd>
            </div>
            <div className="profile-detail">
              <dt>Date of birth</dt>
              <dd>
                {profile.date_of_birth || '—'}
                {profile.age != null && (
                  <span className="profile-muted"> · age {profile.age}</span>
                )}
              </dd>
            </div>
            <div className="profile-detail">
              <dt>Gender</dt>
              <dd>{profile.gender || '—'}</dd>
            </div>
            <div className="profile-detail profile-detail-full">
              <dt>Bio</dt>
              <dd>{profile.bio || '—'}</dd>
            </div>
            <div className="profile-detail">
              <dt>Phone</dt>
              <dd>
                {profile.phone_country_code && profile.phone_number
                  ? `${profile.phone_country_code} ${profile.phone_number}`
                  : '—'}
              </dd>
            </div>
            <div className="profile-detail">
              <dt>Member since</dt>
              <dd>{new Date(profile.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
};

export default Profile;
