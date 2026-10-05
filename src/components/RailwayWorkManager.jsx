import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  MapPin,
  Wrench,
  TrainTrack
} from 'lucide-react';
import { supabase } from '../supabase';
import { useRailwayNetwork } from '../context/RailwayNetworkContext';

export default function RailwayWorkManager() {
  const { selectedZone, selectedDivision, selectedStation } = useRailwayNetwork();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const initialFormState = {
    zone: 'SR',
    division: 'MAS',
    station: 'Chennai Central (MAS)',
    latitude: 13.0827,
    longitude: 80.2707,
    work_type: 'Track Renewal',
    work_description: 'Rail track welding & ballast tamping',
    track_details: 'Track 3A - Line 4 Switch point #102',
    signal_details: 'Axle counter sensor calibration',
    ohe_details: 'OHE Catenary wire tension inspection',
    status: 'PENDING'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch all railway work records
  const fetchRailwayWorkRecords = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from('railway_work')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching railway work records:', err);
      setErrorMsg(
        err.message || 'Failed to fetch railway work records from Supabase.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRailwayWorkRecords();
  }, []);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingRecord(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingRecord(record);

    setFormData({
      zone: record.zone || '',
      division: record.division || '',
      station: record.station || '',
      latitude: record.latitude || 0,
      longitude: record.longitude || 0,
      work_type: record.work_type || '',
      work_description: record.work_description || '',
      track_details: record.track_details || '',
      signal_details: record.signal_details || '',
      ohe_details: record.ohe_details || '',
      status: record.status || 'PENDING'
    });

    setShowAddModal(true);
  };

  // Submit Handler: Insert or Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      zone: formData.zone,
      division: formData.division,
      station: formData.station,
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      work_type: formData.work_type,
      work_description: formData.work_description,
      track_details: formData.track_details,
      signal_details: formData.signal_details,
      ohe_details: formData.ohe_details,
      status: formData.status
    };

    try {
      if (editingRecord) {
        const { error } = await supabase
          .from('railway_work')
          .update(payload)
          .eq('id', editingRecord.id)
          .select();

        if (error) throw error;

        setSuccessMsg(
          `Railway work record #${editingRecord.id} updated successfully!`
        );
      } else {
        const { error } = await supabase
          .from('railway_work')
          .insert([payload])
          .select();

        if (error) throw error;

        setSuccessMsg(
          'New railway work record inserted successfully into Supabase!'
        );
      }

      setShowAddModal(false);
      resetForm();

      await fetchRailwayWorkRecords();
    } catch (err) {
      console.error('Error saving railway work record:', err);

      setErrorMsg(
        err.message || 'Failed to save railway work record.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        `Are you sure you want to delete railway work record #${id}?`
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);
      setErrorMsg(null);
      setSuccessMsg(null);

      const { error } = await supabase
        .from('railway_work')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccessMsg(
        `Railway work record #${id} deleted successfully!`
      );

      await fetchRailwayWorkRecords();
    } catch (err) {
      console.error('Error deleting railway work record:', err);

      setErrorMsg(
        err.message || 'Failed to delete record.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm space-y-4 font-sans text-[#111111]">

      {/* =========================================================
          TABLE HEADER & CONTROLS
      ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5]">
            <TrainTrack className="w-5 h-5 text-[#111111]" />
          </div>

          <div>

            <div className="flex items-center gap-2 flex-wrap">

              <h3 className="text-sm font-extrabold text-[#111111] tracking-wide uppercase">
                SUPABASE LIVE DATABASE: RAILWAY_WORK
              </h3>

              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] font-bold">
                {records.length} RECORDS
              </span>

            </div>

            <p className="text-xs text-[#525252] font-medium mt-0.5">
              Live synchronized railway work items stored in table{' '}
              <code className="text-[#111111] bg-[#F5F5F5] px-1.5 py-0.5 rounded border border-[#E5E5E5] font-bold">
                railway_work
              </code>
            </p>

          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">

          <button
            onClick={fetchRailwayWorkRecords}
            disabled={loading}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F5F5F5] text-[#111111] text-xs px-3.5 py-2 rounded-xl border border-[#E5E5E5] hover:border-[#D4D4D4] transition-all disabled:opacity-50 font-bold shadow-sm"
            title="Refresh database records"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#111111]' : ''}`}
            />
            <span>FETCH</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-[#111111] hover:bg-[#262626] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>INSERT RAILWAY WORK</span>
          </button>

        </div>
      </div>


      {/* =========================================================
          ERROR NOTIFICATION
      ========================================================= */}
      {errorMsg && (
        <div className="bg-slate-100 border border-slate-300 text-slate-900 text-xs p-3 rounded-lg flex items-center justify-between animate-fadeIn font-semibold">

          <div className="flex items-center gap-2">

            <AlertTriangle className="w-4 h-4 text-slate-900 shrink-0" />

            <span>{errorMsg}</span>

          </div>

          <button
            onClick={() => setErrorMsg(null)}
            className="text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      )}


      {/* =========================================================
          SUCCESS NOTIFICATION
      ========================================================= */}
      {successMsg && (
        <div className="bg-slate-100 border border-slate-300 text-slate-900 text-xs p-3 rounded-lg flex items-center justify-between animate-fadeIn font-semibold">

          <div className="flex items-center gap-2">

            <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />

            <span>{successMsg}</span>

          </div>

          <button
            onClick={() => setSuccessMsg(null)}
            className="text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      )}


      {/* =========================================================
          LOADING STATE
      ========================================================= */}
      {loading ? (

        <div className="py-12 flex flex-col items-center justify-center text-slate-600 space-y-3 text-xs">

          <Loader2 className="w-7 h-7 animate-spin text-slate-900" />

          <span className="font-bold">
            Connecting to Supabase and loading railway_work records...
          </span>

        </div>

      ) : records.length === 0 ? (

        /* =========================================================
           EMPTY DATA STATE
        ========================================================= */

        <div className="py-12 px-6 text-center bg-white border border-[#E5E5E5] rounded-2xl space-y-3 shadow-sm">

          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#111111] shadow-sm">

            <Database className="w-6 h-6" />

          </div>

          <div className="space-y-1">

            <h4 className="text-base font-extrabold text-[#111111]">
              No Railway Work Records Found
            </h4>

            <p className="text-xs text-[#525252] font-medium max-w-md mx-auto">

              The{' '}

              <code className="text-[#111111] font-bold bg-[#F5F5F5] px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                railway_work
              </code>{' '}

              table is currently empty in Supabase. Click the button below
              to insert your first record.

            </p>

          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#111111] hover:bg-[#262626] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>INSERT FIRST RECORD</span>
          </button>

        </div>

      ) : (

        /* =========================================================
           DATA TABLE VIEW
        ========================================================= */

        <div className="overflow-x-auto border border-[#E5E5E5] rounded-xl shadow-sm">

          <table className="w-full text-left text-xs">

            <thead>

              <tr className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[#111111] text-[10px] font-bold tracking-wider">

                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">WORK DETAILS</th>
                <th className="py-3 px-4">DEPT ASSET DETAILS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">CREATED AT</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#E5E5E5] bg-white">

              {filteredRecords.map((rec) => (

                <tr
                  key={rec.id}
                  className="hover:bg-slate-50 transition-colors"
                >

                  {/* ID */}
                  <td className="py-3 px-3 text-slate-900 font-extrabold">

                    #{rec.id}

                  </td>


                  {/* LOCATION */}
                  <td className="py-3 px-3">

                    <div className="font-extrabold text-slate-900 flex items-center gap-1">

                      <MapPin className="w-3.5 h-3.5 text-slate-900 shrink-0" />

                      <span>
                        {rec.station || 'N/A'}
                      </span>

                    </div>

                    <div className="text-[10px] text-slate-600 mt-0.5 font-semibold">

                      Zone:{' '}

                      <span className="text-slate-900 font-bold">
                        {rec.zone}
                      </span>

                      {' | '}

                      Div:{' '}

                      <span className="text-slate-900 font-bold">
                        {rec.division}
                      </span>

                    </div>

                    {rec.latitude && rec.longitude ? (

                      <div className="text-[9px] text-slate-500">
                        ({rec.latitude}, {rec.longitude})
                      </div>

                    ) : null}

                  </td>


                  {/* WORK DETAILS */}
                  <td className="py-3 px-3 max-w-xs">

                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-900 border border-slate-300 uppercase inline-block mb-1">

                      {rec.work_type || 'GENERAL'}

                    </span>

                    <p className="text-slate-800 text-xs font-medium leading-tight line-clamp-2">

                      {rec.work_description || 'No description provided'}

                    </p>

                  </td>


                  {/* DEPARTMENT DETAILS */}
                  <td className="py-3 px-3 text-[10px] text-slate-700 space-y-0.5 max-w-xs font-semibold">

                    {rec.track_details && (
                      <div>
                        <strong className="text-slate-900">
                          Track:
                        </strong>{' '}
                        {rec.track_details}
                      </div>
                    )}

                    {rec.signal_details && (
                      <div>
                        <strong className="text-slate-900">
                          Signal:
                        </strong>{' '}
                        {rec.signal_details}
                      </div>
                    )}

                    {rec.ohe_details && (
                      <div>
                        <strong className="text-slate-900">
                          OHE:
                        </strong>{' '}
                        {rec.ohe_details}
                      </div>
                    )}

                    {!rec.track_details &&
                      !rec.signal_details &&
                      !rec.ohe_details && (
                        <span className="text-slate-400">
                          None specified
                        </span>
                      )}

                  </td>


                  {/* STATUS */}
                  <td className="py-3 px-3">

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase ${rec.status === 'APPROVED'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : rec.status === 'COMPLETED'
                            ? 'bg-slate-700 text-white border-slate-700'
                            : rec.status === 'IN_PROGRESS'
                              ? 'bg-slate-200 text-slate-900 border-slate-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                    >
                      {rec.status || 'PENDING'}
                    </span>

                  </td>


                  {/* CREATED AT */}
                  <td className="py-3 px-3 text-[10px] text-slate-600 font-semibold">

                    {rec.created_at
                      ? new Date(rec.created_at).toLocaleString('en-IN')
                      : 'Just now'}

                  </td>


                  {/* ACTIONS */}
                  <td className="py-3 px-3 text-right">

                    <div className="flex items-center justify-end gap-1.5">

                      {/* EDIT */}
                      <button
                        onClick={() => handleOpenEditModal(rec)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 transition-all font-bold"
                        title="Update record by ID"
                      >

                        <Edit3 className="w-3.5 h-3.5" />

                      </button>


                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(rec.id)}
                        disabled={deletingId === rec.id}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded border border-slate-300 transition-all disabled:opacity-50 font-bold"
                        title="Delete record by ID"
                      >

                        {deletingId === rec.id ? (

                          <Loader2 className="w-3.5 h-3.5 animate-spin" />

                        ) : (

                          <Trash2 className="w-3.5 h-3.5" />

                        )}

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}


      {/* =========================================================
          CREATE / EDIT MODAL
      ========================================================= */}
      {showAddModal && (

        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white border border-slate-300 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 font-sans animate-fadeIn text-slate-900">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">

              <div className="flex items-center gap-2">

                <Wrench className="w-5 h-5 text-slate-900" />

                <h3 className="text-base font-extrabold text-slate-900 uppercase">

                  {editingRecord
                    ? `UPDATE RAILWAY WORK #${editingRecord.id}`
                    : 'INSERT NEW RAILWAY WORK'}

                </h3>

              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* ID NOTE */}
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 flex items-start gap-2 font-semibold">

              <Database className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />

              <div>

                <strong>Identity Field Note:</strong>{' '}

                Record{' '}

                <code className="text-slate-900 bg-white px-1 rounded border border-slate-300">
                  id
                </code>{' '}

                is automatically generated by Supabase Identity constraint
                and cannot be entered manually.

              </div>

            </div>


            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 text-xs"
            >

              {/* ZONE / DIVISION / STATION */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* Zone */}
                <div>

                  <label className="block text-slate-700 font-bold mb-1">
                    ZONE
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.zone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zone: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="e.g. SR, NR"
                  />

                </div>


                {/* Division */}
                <div>

                  <label className="block text-slate-700 font-bold mb-1">
                    DIVISION
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.division}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        division: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="e.g. MAS, SA, TPJ"
                  />

                </div>


                {/* Station */}
                <div>

                  <label className="block text-slate-700 font-bold mb-1">
                    STATION
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.station}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        station: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="e.g. Chennai Central (MAS)"
                  />

                </div>

              </div>


              {/* LAT / LONG / STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* Latitude */}
                <div>

                  <label className="block text-slate-700 font-bold mb-1">
                    LATITUDE
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="13.0827"
                  />

                </div>


                {/* Longitude */}
                <div>

                  <label className="block text-slate-700 font-bold mb-1">
                    LONGITUDE
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="80.2707"
                  />

                </div>


                {/* Status */}
                <div>

                  <label className="block text-slate-700 font-bold mb-1">
                    STATUS
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                  >

                    <option value="PENDING">
                      PENDING
                    </option>

                    <option value="IN_PROGRESS">
                      IN_PROGRESS
                    </option>

                    <option value="APPROVED">
                      APPROVED
                    </option>

                    <option value="COMPLETED">
                      COMPLETED
                    </option>

                  </select>

                </div>

              </div>


              {/* WORK TYPE / DESCRIPTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Work Type */}
                <div>

                  <label className="block text-slate-700 font-bold mb-1">
                    WORK TYPE
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.work_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        work_type: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="e.g. Track Renewal, Signal Check"
                  />

                </div>


                {/* Work Description */}
                <div>

                  <label className="block text-slate-700 font-bold mb-1">
                    WORK DESCRIPTION
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.work_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        work_description: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="Brief details of planned maintenance"
                  />

                </div>

              </div>


              {/* DEPARTMENT DETAILS */}
              <div className="space-y-3 pt-2 border-t border-slate-200">

                <h4 className="text-[11px] text-slate-800 font-extrabold uppercase tracking-wider">
                  DEPARTMENTAL TECHNICAL SPECIFICATIONS
                </h4>


                {/* Track */}
                <div>

                  <label className="block text-slate-600 font-bold text-[10px] mb-1">
                    TRACK DETAILS
                  </label>

                  <input
                    type="text"
                    value={formData.track_details}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        track_details: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="e.g. Line 3 Switch #102 rail replacement"
                  />

                </div>


                {/* Signal */}
                <div>

                  <label className="block text-slate-600 font-bold text-[10px] mb-1">
                    SIGNAL DETAILS
                  </label>

                  <input
                    type="text"
                    value={formData.signal_details}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        signal_details: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="e.g. Point machine motor & axle counter sensor test"
                  />

                </div>


                {/* OHE */}
                <div>

                  <label className="block text-slate-600 font-bold text-[10px] mb-1">
                    OHE DETAILS
                  </label>

                  <input
                    type="text"
                    value={formData.ohe_details}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ohe_details: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-semibold"
                    placeholder="e.g. 25kV catenary wire height adjustment"
                  />

                </div>

              </div>


              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-lg border border-slate-300 transition-all"
                >
                  CANCEL
                </button>


                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >

                  {submitting ? (

                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />

                      <span>
                        SAVING TO SUPABASE...
                      </span>
                    </>

                  ) : (

                    <>
                      <CheckCircle2 className="w-4 h-4" />

                      <span>
                        {editingRecord
                          ? 'UPDATE RECORD'
                          : 'INSERT RECORD'}
                      </span>
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}