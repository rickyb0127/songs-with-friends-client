import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import Rules from './Rules';

function NavBar() {
  const [showRulesModal, setShowRulesModal] = useState(false);

  return (
    <nav className="w-[100%] h-[52px] bg-marine-blue">
      <div className="h-full mobile:max-w-full tablet:max-w-[700px] desktop:max-w-[700px] px-5 mx-auto">
        <div className="flex h-full items-center justify-between text-[20px] text-white">
          <FontAwesomeIcon icon={faMusic} />
          <FontAwesomeIcon className="cursor-pointer" onClick={() => {setShowRulesModal(true)}} icon={faCircleInfo} />
        </div>
      </div>
      {showRulesModal && 
        <div className="flex absolute top-0 w-full h-[100vh] justify-center bg-cool-gray opacity-95 text-white">
          <div className="flex flex-col mobile:w-full tablet:w-[700px] desktop:w-[700px]">
            <FontAwesomeIcon className="self-end py-[11px] pr-[20px] text-[30px] font-bold cursor-pointer" onClick={() => {setShowRulesModal(false)}} icon={faXmark} />
            <div className="px-[20px]">
              <Rules />
            </div>
          </div>
        </div>
      }
    </nav>
  )
}

export default NavBar;