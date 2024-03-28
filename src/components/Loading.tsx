import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

function Loading() {
  return (
    <div className="loading-container">
      <div className="text-2xl pt-[200px]">
        <FontAwesomeIcon className="animate-spin mr-3" icon={faSpinner} />
        <span>Loading...</span>
      </div>
    </div>
  );
}

export default Loading;