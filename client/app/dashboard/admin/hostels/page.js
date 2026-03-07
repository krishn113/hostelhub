"use client";
import { useState, useEffect } from "react";
import API from "@/lib/api";
import { Building2, Pencil, Plus, DoorOpen, Trash2} from "lucide-react";

export default function AdminHostels() {

  const [hostels, setHostels] = useState([]);

  const [form, setForm] = useState({
    name: "",
    type: "Mixed",
    roomConfigs: [{ capacity: "", rooms: "" }]
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const res = await API.get("/admin/hostels");
      setHostels(res.data);
    } catch (err) {
      console.error("Error fetching hostels", err);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "Mixed",
      roomConfigs: [{ capacity: "", rooms: "" }]
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleSubmit = async () => {

    console.log("EditMode:", editMode);
    console.log("EditId:", editId);

    if (!form.name.trim()) {
      alert("Hostel name required");
      return;
    }

    if (form.roomConfigs.some(c => !c.capacity || !c.rooms)) {
      alert("Fill all room configs");
      return;
    }

    try {

      const payload = {
        name: form.name,
        type: form.type,
        roomConfigs: form.roomConfigs.map(c => ({
          capacity: Number(c.capacity),
          rooms: Number(c.rooms)
        }))
      };

      console.log("Payload:", payload);

      if (editMode) {
        await API.put(`/admin/hostels/${editId}`, payload);
        console.log("Updating hostel...");
      } else {
        await API.post("/admin/hostels", payload);
        console.log("Creating hostel...");
      }

      resetForm();
      setShowEditModal(false);
      fetchHostels();

    } catch (err) {
      console.error("Submit error", err.response?.data || err);
    }
  };

  const handleEdit = (h) => {
    console.log("Editing hostel:", h);

    setEditMode(true);
    setEditId(h._id);

    setForm({
      name: h.name || "",
      type: h.type || "Mixed",
      roomConfigs:
        h.roomConfigs?.length
          ? h.roomConfigs.map((r) => ({
              capacity: r.capacity?.toString() || "",
              rooms: r.rooms?.toString() || ""
            }))
          : [{ capacity: "", rooms: "" }]
    });

    setShowEditModal(true);
  };

  const addRoomConfig = () => {
    setForm({
      ...form,
      roomConfigs: [...form.roomConfigs, { capacity: "", rooms: "" }]
    });
  };

  const updateRoomConfig = (index, field, value) => {

    const updated = [...form.roomConfigs];
    updated[index][field] = value;

    setForm({
      ...form,
      roomConfigs: updated
    });
  };

  const deleteRoomConfig = (index) => {

    if (form.roomConfigs.length === 1) return;

    const updated = form.roomConfigs.filter((_, i) => i !== index);

    setForm({
      ...form,
      roomConfigs: updated
    });
  };

  const totalRooms = form.roomConfigs.reduce(
    (sum, config) => sum + (Number(config.rooms) || 0),
    0
  );

  return (
    <div className="w-full px-8 py-6 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-end">

        <div>
          <h1 className="text-4xl font-black text-slate-900">
            Hostel Management
          </h1>
          <p className="text-slate-500">Create and manage hostels</p>
        </div>

        <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold text-xs">
          {hostels.length} Hostels
        </div>

      </div>

      {/* FORM */}

      <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">

        <div className="grid md:grid-cols-2 gap-6">

          <input
            value={form.name}
            onChange={(e)=>setForm({...form,name:e.target.value})}
            placeholder="Hostel Name"
            className="bg-slate-50 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={form.type}
            onChange={(e)=>setForm({...form,type:e.target.value})}
            className="bg-slate-50 p-4 rounded-xl"
          >
            <option>Boys</option>
            <option>Girls</option>
            <option>Mixed</option>
          </select>

        </div>

        {/* ROOM CONFIG */}

        <div className="space-y-4">

          <div className="flex justify-between text-sm font-bold text-indigo-600">
            <span>Room Capacities</span>
            <span>Total Rooms: {totalRooms}</span>
          </div>

          {form.roomConfigs.map((config,index)=>(
            <div
              key={index}
              className="grid grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl"
            >

              <input
                type="number"
                placeholder="Capacity"
                value={config.capacity}
                onChange={(e)=>updateRoomConfig(index,"capacity",e.target.value)}
                className="p-2 rounded-lg"
              />

              <input
                type="number"
                placeholder="Rooms"
                value={config.rooms}
                onChange={(e)=>updateRoomConfig(index,"rooms",e.target.value)}
                className="p-2 rounded-lg"
              />

              {form.roomConfigs.length>1 && (
                <button
                  onClick={()=>deleteRoomConfig(index)}
                  className="flex items-center gap-1 text-red-600 text-xs font-bold"
                >
                   <Trash2 size={14}/>
                </button>
              )}

            </div>
          ))}

          <button
            onClick={addRoomConfig}
            className="text-indigo-600 font-bold text-sm"
          >
            + Add Capacity
          </button>

        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={16}/>
          {editMode ? "Update Hostel" : "Add Hostel"}
        </button>

      </div>

      {/* HOSTEL CARDS */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {hostels.map(h=>(
          <div
            key={h._id}
            className="bg-white p-8 rounded-3xl border shadow-sm hover:shadow-lg transition relative"
          >

            <Building2 className="absolute right-4 top-4 opacity-10" size={70}/>

            <div className="flex justify-between mb-4">

              <div>
                <h3 className="text-xl font-bold">{h.name}</h3>
                <p className="text-sm text-slate-500">{h.type} Hostel</p>
              </div>

              <button
                onClick={()=>handleEdit(h)}
                className="text-indigo-600 text-xs font-bold flex gap-1 items-center z-10"
              >
                <Pencil size={12}/> Edit
              </button>

            </div>

            <div className="flex gap-2 text-sm text-slate-600">
              <DoorOpen size={16}/>
              Total Rooms: <b>{h.totalRooms}</b>
            </div>

          </div>
        ))}

      </div>

      {/* EDIT MODAL */}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[500px] p-8 rounded-3xl space-y-6">

            <h2 className="text-xl font-bold">Edit Hostel</h2>

            <input
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})}
              className="w-full bg-slate-50 p-3 rounded-xl"
            />

            <select
              value={form.type}
              onChange={(e)=>setForm({...form,type:e.target.value})}
              className="w-full bg-slate-50 p-3 rounded-xl"
            >
              <option>Boys</option>
              <option>Girls</option>
              <option>Mixed</option>
            </select>

            {form.roomConfigs.map((config,index)=>(
              <div key={index} className="grid grid-cols-5 gap-2">

                <input
                  value={config.capacity}
                  type="number"
                  onChange={(e)=>updateRoomConfig(index,"capacity",e.target.value)}
                  className="col-span-2 bg-slate-50 p-2 rounded-lg"
                />

                <input
                  value={config.rooms}
                  type="number"
                  onChange={(e)=>updateRoomConfig(index,"rooms",e.target.value)}
                  className="col-span-2 bg-slate-50 p-2 rounded-lg"
                />

                {form.roomConfigs.length>1 && (
                  <button onClick={()=>deleteRoomConfig(index)}> <Trash2 size={14}/></button>
                )}

              </div>
            ))}

            <button
              onClick={addRoomConfig}
              className="text-indigo-600 text-sm"
            >
              + Add Capacity
            </button>

            <div className="flex gap-3">

              <button
                onClick={()=>{
                  setShowEditModal(false)
                  resetForm()
                }}
                className="flex-1 bg-slate-100 py-3 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl"
              >
                Update Hostel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}