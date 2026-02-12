"use client";
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import EmployeeTable from './EmployeeTable';
import EmployeeProfileModal from './EmployeeProfileModal';

export default function CategoryListModal({ isOpen, onClose, category, employees }) {
    const [selectedProfile, setSelectedProfile] = useState(null);

    // Filter employees for this category just to be safe, or assume parent passes filtered list
    // Ideally parent passes filtered list to keep this component dumb
    const displayedEmployees = employees;

    return (
        <>
            <Transition.Root show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-[#0f0f11] border border-white/10 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-5xl">
                                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                        <button
                                            type="button"
                                            className="rounded-md bg-transparent text-zinc-400 hover:text-white focus:outline-none"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close</span>
                                            <X className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-white mb-6">
                                            {category} <span className="text-zinc-500 font-normal">({displayedEmployees.length})</span>
                                        </Dialog.Title>

                                        <div className="mt-4">
                                            {/* Reuse EmployeeTable but we might want to hide 9-box column if redundant */}
                                            {/* For now, just using it as is is fine, it provides consistency */}
                                            <EmployeeTable employees={displayedEmployees} />
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* 
               Note: EmployeeTable inside the modal handles its own ProfileModal state. 
               However, if EmployeeTable's profile modal is global or conflicts, we might need to adjust.
               Looking at EmployeeTable code, it has its own local state for `selectedProfile`, so it should work fine nested.
            */}
        </>
    );
}
