import React, { useEffect, useState } from "react";
import { fetchDoctorProfile, updateDoctorProfile } from "../../api/api";

const DoctorProfileDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDoctorProfile()
      .then(data => {
        setProfile(data);
        setForm(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateDoctorProfile({
        full_name: form.full_name,
        medical_experience: form.medical_experience
      });
      setProfile({ ...profile, ...updated });
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  if (error) return <div className="text-red-600 text-center mt-8">{error}</div>;
  if (!form) return null;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">My Profile</h2>
      <form className="space-y-4" onSubmit={handleUpdate}>
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
          <input name="full_name" value={form.full_name || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Username</label>
          <input name="username" value={form.username || ""} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Email</label>
          <input name="email" value={form.email || ""} disabled className="w-full border rounded px-3 py-2 bg-gray-100" type="email" />
        </div>
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Contact Number</label>
          <input name="contact_number" value={form.contact_number || ""} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Medical Experience (years)</label>
          <input name="medical_experience" value={form.medical_experience || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" min="0" />
        </div>
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Specialization</label>
          <input name="specialization" value={form.specialization || ""} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>
        {success && <div className="text-green-600 text-center">{success}</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold mt-4" disabled={updating}>{updating ? "Updating..." : "Update"}</button>
      </form>
    </div>
  );
};

export default DoctorProfileDashboard; 