import React, { useState, useEffect } from "react";
import { useFormStore } from "../store/context";
import Navbar from "./Navbar";
import api from "../api";
import { 
  FaWpforms, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle,
  FaEye,
  FaDownload,
  FaHistory,
  FaChartBar,
  FaTimes,
  FaPaperPlane
} from "react-icons/fa";
import FormSubmission from "./FormSubmission";

export default function ClientPortal() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [activeTab, setActiveTab] = useState("forms"); 
  const { state, dispatch } = useFormStore();
  const [formData, setFormData] = useState([]);
  const [activeForms, setActiveForms] = useState(0);
  const [totalForms, setTotalForms] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await api.get("forms/");
        setFormData(response.data);
        setTotalForms(response.data.length);
        dispatch({ type: "SET_FORMS", payload: response.data });
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const response = await api.get("submissions/");
        setTotalSubmissions(response.data.length);
        dispatch({ type: "SET_SUBMISSIONS", payload: response.data });
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchForms();
    fetchSubmissions();
  }, [dispatch]); 

  useEffect(() => {
    const activeForms = Array.isArray(state.forms) ? state?.forms.filter((form) => form.is_active === true) : [];  
    setActiveForms(activeForms.length);

    const pendingSubmissions = Array.isArray(state.submissions) ? state?.submissions.filter((submission) => submission.status === 'pending') : [];
    setPendingSubmissions(pendingSubmissions.length);
  }, [state.forms, state.submissions]); 

  // Filter user's submissions
  const mySubmissions = Array.isArray(state.submissions) ? state?.submissions?.filter((submission) => 
    submission.created_by === state.user?.id
  ) : []

  // Group submissions by status
  const approvedSubmissions = mySubmissions.filter(s => s.status === 'approved');
  const pendingSubmissionsList = mySubmissions.filter(s => s.status === 'pending');
  const rejectedSubmissions = mySubmissions.filter(s => s.status === 'rejected');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getFieldName = (fieldID, formId) => {

    
    // Find the form
    const form = state.forms.find(f => f.id == formId);
    if (!form) {
    
      return `Field ${fieldID}`;
    }
    
    // Get all fields
    const allFields = form.schema?.flatMap(section => section?.fields || []) || [];

    
    // Find the specific field - use different variable name
    const targetField = allFields.find((f,idx) => idx + 1 == fieldID);
    
    const result = targetField?.label || `Field ${fieldID}`;
   
    
    return result;
  };
  

  if (selectedForm) {
    const form = state.forms.find((f) => f.id === selectedForm.id);
    return <FormSubmission form={form} onBack={() => setSelectedForm(null)} />;
  }

  const renderSubmissionModal = () => {
    if (!isModalOpen || !selectedSubmission) return null;
  
    const form = state.forms.find(f => f.id === selectedSubmission.form);
    
    return (
     <div className="fixed inset-0 bg-slate-200/90 bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
    {/* Modal Header */}
    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Submission Details</h2>
          <p className="text-blue-100 mt-1">
            {form?.name} • Submitted on {formatDate(selectedSubmission.created_at)}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(false)}
          className="text-white hover:text-blue-200 transition-colors duration-200 p-2"
        >
          <FaTimes size={24} />
        </button>
      </div>
    </div>

    {/* Status Badge */}
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
            {getStatusIcon(selectedSubmission.status)}
            <span className="ml-2 capitalize">{selectedSubmission.status}</span>
          </span>
          <span className="text-sm text-gray-600">
            Version {selectedSubmission.form_version}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Submission ID: #{selectedSubmission.id}
        </div>
      </div>
    </div>

    {/* Submission Content - Form-like Layout */}
    <div className="p-6 overflow-y-auto max-h-[60vh]">
      {/* Group submission data by sections if available, otherwise create default section */}
      {(selectedSubmission.form?.schema || []).length > 0 ? (
        <div className="space-y-8">
          {selectedSubmission.form.schema.map((section, sectionIndex) => {
            // Get fields that belong to this section
            const sectionFields = selectedSubmission.submission_data?.filter(fieldData => {
              const fieldId = fieldData.field.split('.').pop(); // Extract field ID from field path
              return section.fields?.some(field => field.id === fieldId);
            }) || [];

            if (sectionFields.length === 0) return null;

            return (
              <div key={section.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Section Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {sectionIndex + 1}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{section.name}</h2>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Fields in 3-column grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectionFields.map((fieldData, fieldIndex) => {
                      const fieldLabel = getFieldName(fieldData.field, selectedSubmission.form);
                      const fieldConfig = section.fields?.find(field => {
                        const fieldId = fieldData.field.split('.').pop();
                        return field.id === fieldId;
                      });

                      // Determine if field should be full-width
                      const fullWidthFields = ['textarea', 'file'];
                      const isFullWidth = fieldConfig && fullWidthFields.includes(fieldConfig.type);
                      
                      return (
                        <div 
                          key={fieldIndex} 
                          className={`space-y-2 ${isFullWidth ? 'md:col-span-2 lg:col-span-3' : ''}`}
                        >
                          <label className="block text-sm font-medium text-gray-700">
                            {fieldLabel}
                          </label>
                          <div className="bg-gray-50 rounded-lg p-4 min-h-[44px] border border-gray-200">
                            <div className="text-gray-700 whitespace-pre-wrap break-words">
                              {fieldData.value || (
                                <em className="text-gray-400">No value provided</em>
                              )}
                            </div>
                          </div>
                          {fieldConfig?.type === 'file' && fieldData.value && (
                            <p className="text-xs text-gray-500 mt-1">
                              📎 File attached
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback: Single section layout when no schema is available */
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Submission Data</h2>
                <p className="text-sm text-gray-600 mt-1">All submitted form fields</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedSubmission.submission_data?.map((fieldData, index) => {
                const fieldLabel = getFieldName(fieldData.field, selectedSubmission.form);
                
                return (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {fieldLabel}
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[44px] border border-gray-200">
                      <div className="text-gray-700 whitespace-pre-wrap break-words">
                        {fieldData.value || (
                          <em className="text-gray-400">No value provided</em>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!selectedSubmission.submission_data || selectedSubmission.submission_data.length === 0) && (
                <div className="col-span-full text-center py-8">
                  <FaFileAlt className="mx-auto text-gray-400 text-4xl mb-4" />
                  <p className="text-gray-500 text-lg">No submission data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Modal Footer */}
    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Welcome Header */}
      <Navbar />
      <div className=" rounded-lg p-6 text-black w-[80%] mx-24 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              Welcome back, {state?.user?.username}
            </h2>
            <p className="text-neutral-600 mt-1">
              Complete your onboarding forms to access all our services
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
           
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalForms}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaWpforms className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Submissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{mySubmissions.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaHistory className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingSubmissionsList.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{approvedSubmissions.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("forms")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "forms"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FaWpforms size={16} />
              <span>Available Forms</span>
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "submissions"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FaHistory size={16} />
              <span>My Submissions ({mySubmissions.length})</span>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "forms" ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Forms</h2>
              <p className="text-gray-600 mt-1">Complete the required forms to access our services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.forms.map((form) => (
                <div key={form.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FaWpforms className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{form.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{form.category}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        form.latest_version === form.version 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.latest_version === form.version ? 'Latest' : `v${form.version}`}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {form.description}
                    </p>

                    <button
                      onClick={() => setSelectedForm(form)}
                      className="cursor-pointer w-full bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      Fill Form
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Submissions</h2>
              <p className="text-gray-600 mt-1">Track the status of all your form submissions</p>
            </div>

            {mySubmissions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaHistory className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-500 mb-6">Get started by filling out one of our available forms</p>
                <button
                  onClick={() => setActiveTab("forms")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Browse Forms
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {mySubmissions.map((submission) => {
                  const form = state.forms.find(f => f.id === submission.form);
                  return (
                    <div key={submission.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              {getStatusIcon(submission.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {form?.name || `Submission #${submission.id}`}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Submitted on {formatDate(submission.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                              {getStatusIcon(submission.status)}
                              <span className="ml-1 capitalize">{submission.status}</span>
                            </span>
                            <p className="text-xs text-gray-500 mt-1">v{submission.form_version}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {submission.submission_data?.slice(0, 4).map((field, index) => (
                            <div key={index} className="space-y-1">
                              <span className="text-sm font-medium text-gray-700">{getFieldName(field.field, submission.form)}:</span>
                              <p className="text-sm text-gray-600 truncate">{field.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <FaChartBar size={14} />
                            <span>{submission.submission_data?.length || 0} fields submitted</span>
                          </div>
                          <div className="flex items-center space-x-3">
                      
                              <button 
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setIsModalOpen(true);
                                }}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                <FaEye size={14} />
                                <span>View Details</span>
                              </button>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {renderSubmissionModal()}
    </div>


  );
}