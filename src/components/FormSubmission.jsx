import React, { useState } from "react";
import { useFormStore } from "../store/context";
import api from "../api";
import { toast, ToastContainer } from 'react-toastify';

// ✅ React Icons
import {
  FaArrowLeft,
  FaUpload,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaSave,
  FaPaperPlane,
  FaChevronRight,
  FaChevronLeft,
  FaFileAlt,
  FaUser,
  FaIdCard,
  FaHome,
} from "react-icons/fa";

export default function FormSubmission({ form, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state, dispatch } = useFormStore();



  const notify = (message="Submitted Successfully") => toast(message,{
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    type: "success",

  });

  const notifyError = (message="Submission Failed") => toast(message,{
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    type: "error",

  });

  // Group fields by section or create steps dynamically
  const formSteps = form?.schema?.length > 0 
    ? form.schema.map((section, index) => ({
        step: index,
        title: section.name || `Step ${index + 1}`,
        description: section.description || "",
        fields: section.fields || []
      }))
    : [{
        step: 0,
        title: form?.name || "Form Details",
        description: form?.description || "",
        fields: form?.fields || []
      }];

  const currentStepData = formSteps[currentStep];
  const totalSteps = formSteps.length;

  const handleInputChange = (fieldName, value) => {
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ""
      }));
    }
  };

  const handleFileUpload = (fieldName, files) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: files
    }));
    
    const fileNames = Array.from(files).map(file => file.name).join(", ");
    handleInputChange(fieldName, fileNames);
  };

  const validateStep = () => {
    const stepErrors = {};
    
    currentStepData.fields.forEach(field => {
      if (field.required && !formData[field.label]) {
        stepErrors[field.label] = `${field.label} is required`;
      }
      
      if (field.type === 'email' && formData[field.label]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.label])) {
          stepErrors[field.label] = "Please enter a valid email address";
        }
      }
    });
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep() && currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
  
    setIsSubmitting(true);
  
    try {
  
      const submissionArray = Object.entries(formData).map(([label, value, idx]) => {
        const field = form.schema.flatMap((section) => section.fields).find((field) => field.label === label);
        //find index of field in schema
        const fieldIndex = form.schema.flatMap((section) => section.fields).findIndex((field) => field.label === label);
        return { field: fieldIndex + 1, value };
      });
  
      const payload = {
        form: form.id,
        form_version: form.version,
        submission_data: submissionArray,
        created_by: state.user.id,
      };
  
      const res = await api.post("submissions/", payload);

      const newSubmission = res.data;
  
     
      dispatch({
        type: "SET_SUBMISSIONS",
        payload: [...state.submissions, newSubmission]
      });
      notify();
      setTimeout(() => {
      onBack();
    }, 1500);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      notifyError("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const getStepIcon = (stepIndex) => {
    const icons = [FaUser, FaIdCard, FaHome];
    const IconComponent = icons[stepIndex] || FaFileAlt;
    return <IconComponent className="text-lg" />;
  };

  const renderField = (field) => {
    const commonClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
      errors[field.label] 
        ? 'border-red-500 bg-red-50' 
        : 'border-gray-300 hover:border-gray-400'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            className={`${commonClasses} resize-vertical min-h-[100px]`}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            rows={4}
          />
        );
      
      case 'file':
        return (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FaUpload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {field.accept || 'Any files'}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(field.label, e.target.files)}
                multiple={field.multiple}
                accept={field.accept}
              />
            </label>
            {uploadedFiles[field.label] && (
              <div className="flex flex-wrap gap-2">
                {Array.from(uploadedFiles[field.label]).map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm">
                    <FaFileAlt className="text-blue-500" />
                    <span className="text-blue-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = { ...uploadedFiles };
                        delete newFiles[field.label];
                        setUploadedFiles(newFiles);
                        handleInputChange(field.label, '');
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'select':
        return (
          <select
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            className={commonClasses}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={field.label}
                  className="w-4 h-4 text-blue-600"
                  checked={formData[field.label]?.includes(option.value)}
                  onChange={(e) => handleInputChange(field.label, e.target.checked ? [...formData[field.label], option.value] : formData[field.label]?.filter((val) => val !== option.value))}
                />
                <label htmlFor={field.label} className="text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={field.label}
                  className="w-4 h-4 text-blue-600"
                  checked={formData[field.label] === option.value}
                  onChange={(e) => handleInputChange(field.label, e.target.value)}
                />
                <label htmlFor={field.label} className="text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            className={commonClasses}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      
      default:
        return (
          <input
            type={field.type || 'text'}
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            className={commonClasses}
            placeholder={`${field.placeholder || field.label.toLowerCase()}...`}
          />
        );
    }
  };



 

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <FaArrowLeft size={20} />
                <span className="font-medium">Back to Forms</span>
              </button>
            </div>
            <div className="text-right">
              <div className="bg-blue-50 rounded-lg px-4 py-2">
                <p className="text-sm font-medium text-blue-800">Step {currentStep + 1} of {totalSteps}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Progress Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{form?.name}</h1>
                <p className="text-gray-600 text-sm mb-6">
                  {form?.description || "Complete your identity verification and provide required documentation for account setup."}
                </p>
                
                {/* Progress Steps */}
                <div className="space-y-4">
                  {formSteps.map((step, index) => (
                    <div
                      key={step.step}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                        currentStep === index
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep === index
                          ? 'bg-blue-600 text-white'
                          : currentStep > index
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {currentStep > index ? (
                          <FaCheckCircle size={14} />
                        ) : (
                          getStepIcon(index)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          currentStep === index ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </p>
                        <p className={`text-xs ${
                          currentStep === index ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {currentStep === index ? 'In Progress' : currentStep > index ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Form Header */}
              <div className="border-b border-gray-200 px-8 py-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentStepData.title}
                </h2>
                {currentStepData.description && (
                  <p className="text-gray-600 mt-1 text-sm">
                    {currentStepData.description}
                  </p>
                )}
              </div>

              {/* Form Fields */}
              <div className="p-8">
                <div className="space-y-6">
                  {currentStepData.fields.length > 0 ? (
                    currentStepData.fields.map((field, index) => (
                      <div key={field.label || index} className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {renderField(field)}
                        
                        {errors[field.label] && (
                          <div className="flex items-center space-x-2 text-red-600 text-sm">
                            <FaExclamationCircle size={14} />
                            <span>{errors[field.label]}</span>
                          </div>
                        )}
                        
                        {field.helpText && (
                          <p className="text-sm text-gray-500">{field.helpText}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FaFileAlt className="mx-auto text-gray-400 text-4xl mb-4" />
                      <p className="text-gray-500 text-lg">No fields in this section</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                      currentStep === 0
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-sm'
                    }`}
                  >
                    <FaChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-4">
                    {isSubmitting && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-sm">Submitting...</span>
                      </div>
                    )}

                    {currentStep < totalSteps - 1 ? (
                      <button
                        onClick={handleNext}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                      >
                        <span>Next</span>
                        <FaChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="cursor-pointer flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors duration-200 shadow-sm hover:shadow-md"
                      >
                        <FaPaperPlane size={16} />
                        <span>{isSubmitting ? 'Submitting...' : 'Submit Form'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}