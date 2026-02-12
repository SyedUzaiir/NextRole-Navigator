import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function RoleChangeModal({ isOpen, onClose, employee, onConfirm }) {
    const [selectedRole, setSelectedRole] = useState(employee?.role || '');

    useEffect(() => {
        if (employee) {
            setSelectedRole(employee.role || '');
        }
    }, [employee]);

    if (!employee) return null;

    const handleSubmit = () => {
        onConfirm(employee.id, selectedRole);
        onClose();
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[70]" onClose={onClose}>
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-[#0f0f11] border border-white/10 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                                <div className="px-6 py-6 lg:px-8">
                                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-white mb-4">
                                        Change Role for {employee.name}
                                    </Dialog.Title>
                                    <div className="space-y-4">
                                        <p className="text-sm text-zinc-400">
                                            Current Role: <span className="text-white font-medium">{employee.role}</span>
                                        </p>

                                        <div>
                                            <label htmlFor="role" className="block text-sm font-medium leading-6 text-zinc-300 mb-2">
                                                New Role Name
                                            </label>
                                            <input
                                                type="text"
                                                id="role"
                                                name="role"
                                                className="block w-full rounded-md border-0 bg-white/5 py-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 placeholder:text-zinc-500"
                                                placeholder="Enter new role name"
                                                value={selectedRole}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="rounded-md bg-white/5 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                            onClick={handleSubmit}
                                        >
                                            Confirm Change
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
