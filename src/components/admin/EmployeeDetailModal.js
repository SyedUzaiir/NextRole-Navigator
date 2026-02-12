import React from 'react';

const EmployeeDetailModal = ({ isOpen, onClose, employee }) => {
    if (!isOpen || !employee) return null;

    const renderArray = (arr) => {
        if (!arr || arr.length === 0) return <span className="text-gray-400 italic">None listed</span>;
        return (
            <div className="flex flex-wrap gap-2">
                {arr.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                        {item}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/30 rounded-full p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6 -mt-12 flex flex-col flex-1 overflow-y-auto">
                    <div className="flex items-end mb-4">
                        <img
                            src={employee.image}
                            alt={employee.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                        />
                        <div className="ml-4 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <p className="text-xs text-indigo-600 uppercase font-bold tracking-wider">IDP Score</p>
                                <p className="text-2xl font-extrabold text-indigo-900">{employee.idpScore}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <p className="text-xs text-purple-600 uppercase font-bold tracking-wider">Performance</p>
                                <p className="text-2xl font-extrabold text-purple-900">{employee.performanceRating}</p>
                            </div>
                            <div className="p-3 bg-pink-50 rounded-xl">
                                <p className="text-xs text-pink-600 uppercase font-bold tracking-wider">Potential</p>
                                <p className="text-2xl font-extrabold text-pink-900">{employee.potentialRating}</p>
                            </div>
                        </div>

                        {/* Professional Details */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-b border-gray-100 py-4">
                            <div>
                                <p className="text-gray-500 mb-1">Current Role</p>
                                <p className="font-semibold text-gray-800">{employee.role}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Department</p>
                                <p className="font-semibold text-gray-800">{employee.department}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Manager</p>
                                <p className="font-semibold text-gray-800">{employee.reportingManager}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Experience</p>
                                <p className="font-semibold text-gray-800">{employee.workingYears} Years</p>
                            </div>
                        </div>

                        {/* Skills & Certs */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                                    <span className="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span> Technical Skills
                                </p>
                                {renderArray(employee.technicalSkills)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                                    <span className="w-1 h-4 bg-purple-500 rounded-full mr-2"></span> Soft Skills
                                </p>
                                {renderArray(employee.softSkills)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                                    <span className="w-1 h-4 bg-pink-500 rounded-full mr-2"></span> Certifications
                                </p>
                                {renderArray(employee.certifications)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailModal;
