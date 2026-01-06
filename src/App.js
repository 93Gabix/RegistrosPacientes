import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Eye, Edit } from 'lucide-react';

export default function PatientRegistry() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    edad: '',
    obraSocial: '',
    detalles: ''
  });

  // Cargar datos al iniciar desde localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('patients-data');
      if (savedData) {
        const data = JSON.parse(savedData);
        setPatients(data);
      }
    } catch (error) {
      console.log('No hay datos previos guardados');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar datos automáticamente cuando cambian
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('patients-data', JSON.stringify(patients));
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }
  }, [patients, isLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (formData.nombre && formData.apellido && formData.dni) {
      if (editingId) {
        // Actualizar paciente existente
        setPatients(prev => prev.map(p => 
          p.id === editingId 
            ? { ...formData, id: editingId, fechaRegistro: p.fechaRegistro } 
            : p
        ));
        
        // Si el paciente editado estaba seleccionado, actualizar la vista de detalles
        if (selectedPatient?.id === editingId) {
          setSelectedPatient(prev => ({ ...formData, id: editingId, fechaRegistro: prev.fechaRegistro }));
        }
        
        setEditingId(null);
      } else {
        // Crear nuevo paciente
        const newPatient = {
          ...formData,
          id: Date.now(),
          fechaRegistro: new Date().toLocaleDateString()
        };
        setPatients(prev => [...prev, newPatient]);
      }

      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        edad: '',
        obraSocial: '',
        detalles: ''
      });
      setShowForm(false);
    }
  };

  const handleEdit = (patient) => {
    setFormData({
      nombre: patient.nombre,
      apellido: patient.apellido,
      dni: patient.dni,
      edad: patient.edad,
      obraSocial: patient.obraSocial,
      detalles: patient.detalles
    });
    setEditingId(patient.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      edad: '',
      obraSocial: '',
      detalles: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      setPatients(prev => prev.filter(p => p.id !== id));
      if (selectedPatient?.id === id) {
        setSelectedPatient(null);
      }
    }
  };

  const filteredPatients = patients.filter(patient => {
    const search = searchTerm.toLowerCase();
    if (!search) return true;
    
    switch(searchType) {
      case 'dni':
        return patient.dni.includes(search);
      case 'apellido':
        return patient.apellido.toLowerCase().includes(search);
      case 'obraSocial':
        return patient.obraSocial.toLowerCase().includes(search);
      default:
        return (
          patient.nombre.toLowerCase().includes(search) ||
          patient.apellido.toLowerCase().includes(search) ||
          patient.dni.includes(search) ||
          patient.obraSocial.toLowerCase().includes(search)
        );
    }
  });

  // Limpiar selección si el paciente seleccionado no está en los resultados filtrados
  useEffect(() => {
    if (selectedPatient && !filteredPatients.find(p => p.id === selectedPatient.id)) {
      setSelectedPatient(null);
    }
  }, [searchTerm, searchType, filteredPatients, selectedPatient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Sistema de Registro de Pacientes</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los campos</option>
              <option value="dni">DNI</option>
              <option value="apellido">Apellido</option>
              <option value="obraSocial">Obra Social</option>
            </select>
            
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  nombre: '',
                  apellido: '',
                  dni: '',
                  edad: '',
                  obraSocial: '',
                  detalles: ''
                });
                setShowForm(!showForm);
              }}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={20} />
              Nuevo Paciente
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre *"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange(e.target)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido *"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange(e.target)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="dni"
                  placeholder="DNI *"
                  value={formData.dni}
                  onChange={(e) => handleInputChange(e.target)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="edad"
                  placeholder="Edad"
                  value={formData.edad}
                  onChange={(e) => handleInputChange(e.target)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="obraSocial"
                  placeholder="Obra Social"
                  value={formData.obraSocial}
                  onChange={(e) => handleInputChange(e.target)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <textarea
                name="detalles"
                placeholder="Detalles adicionales..."
                value={formData.detalles}
                onChange={(e) => handleInputChange(e.target)}
                rows="3"
                className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingId ? 'Guardar Cambios' : 'Guardar'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Pacientes Registrados ({filteredPatients.length})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {patients.length === 0 
                    ? 'No hay pacientes registrados' 
                    : 'No se encontraron resultados'}
                </p>
              ) : (
                filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPatient?.id === patient.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1" onClick={() => setSelectedPatient(patient)}>
                        <h3 className="font-semibold text-lg">
                          {patient.apellido}, {patient.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">DNI: {patient.dni}</p>
                        {patient.obraSocial && (
                          <p className="text-sm text-gray-600">OS: {patient.obraSocial}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(patient)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalles del Paciente</h2>
              {selectedPatient && (
                <button
                  onClick={() => handleEdit(selectedPatient)}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  <Edit size={16} />
                  Editar
                </button>
              )}
            </div>
            {selectedPatient ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nombre Completo</p>
                    <p className="font-semibold">
                      {selectedPatient.nombre} {selectedPatient.apellido}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">DNI</p>
                    <p className="font-semibold">{selectedPatient.dni}</p>
                  </div>
                  {selectedPatient.edad && (
                    <div>
                      <p className="text-sm text-gray-500">Edad</p>
                      <p className="font-semibold">{selectedPatient.edad} años</p>
                    </div>
                  )}
                  {selectedPatient.obraSocial && (
                    <div>
                      <p className="text-sm text-gray-500">Obra Social</p>
                      <p className="font-semibold">{selectedPatient.obraSocial}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Registro</p>
                    <p className="font-semibold">{selectedPatient.fechaRegistro}</p>
                  </div>
                </div>
                {selectedPatient.detalles && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Detalles Adicionales</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedPatient.detalles}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">
                Selecciona un paciente para ver sus detalles
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}