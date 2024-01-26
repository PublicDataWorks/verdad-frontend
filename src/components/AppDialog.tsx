import { Dialog, Transition } from '@headlessui/react'
import { Fragment, type FC, type ReactElement } from 'react'

interface AppDialogProps {
  children: ReactElement,
  title?: string
  isOpen: boolean
  onClose: () => void,
  className?: string
}

const AppDialog: FC<AppDialogProps> = ({ children, isOpen, onClose, title, className }) => (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={(onClose)}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 bg-black/25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto text-white'>
          <div className='mt-36 flex items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'>
              <Dialog.Panel className={`${className} p-0 max-w-md transform overflow-hidden rounded-md bg-black text-left align-middle shadow-xl transition-all`}>
                <Dialog.Title as='h3' className='text-center pt-2 font-medium leading-6'>
                  {title}
                </Dialog.Title>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )

AppDialog.defaultProps = {
  title: '',
  className: ''
}
export default AppDialog
