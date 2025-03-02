import { useState } from "react";
import { useReservationStore } from "../../store/reservation.store";
import Button from "../form/Button";
import FormInput from "../form/FormInput";
import CustomDateTimePicker from "../form/CustomDateTimePicker";
import { toast } from "react-toastify";
import FormSelect from "../form/FormSelect";
import PageHeader from "../PageHeader";
import { createBooking } from "../../api/booking";
import { useNavigate } from "react-router-dom";
import { useLoadingStore } from "../../store/loading.store";
import LoadingIndicator from "../LoadingIndicator";

const ReserveParking = ({ setConfirmPage }) => {
  const { reservation } = useReservationStore();
  const navigate = useNavigate();

  const { loading, setLoading } = useLoadingStore();

  const vehicleTypeOptions = [
    {
      id: "2Wheeler",
      displayName: "2 Wheeler",
      space: 1,
    },
    {
      id: "4Wheeler",
      displayName: "4 Wheeler",
      space: 3,
    },
  ];

  // States for inputs
  const [fromDateTime, setFromDateTime] = useState(new Date());
  const [toDateTime, setToDateTime] = useState(
    new Date(new Date().getTime() + 7200000) // adding 2 hours as milliseconds
  );
  const [numberPlate, setNumberPlate] = useState("");
  const [vehicleType, setVehicleType] = useState(vehicleTypeOptions[0].id);
  const [error, setError] = useState("");

  const validateDates = () => {
    const differenceInMinutes =
      (toDateTime.getTime() - fromDateTime.getTime()) / 60000;
    if (differenceInMinutes < 30) {
      setError(
        "Reservation must be made in future with at least 30 minutes duration!"
      );
      toast.error(
        "Reservation must be made in future with at least 30 minutes duration!"
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateDates()) {
      // Proceed with form submission
      setLoading(true);
      await createBooking({
        fromDateTime,
        toDateTime,
        numberPlate,
        vehicleType,
      })
        .then((responseData) => {
          if (responseData.error) {
            return toast.error(responseData.error);
          }

          console.log("responseData", responseData.data);

          toast.success(responseData.message);
          navigate("/");
        })
        .catch((error) => {
          toast.error(error.message || "An error occurred.");
        })
        .finally(() => {
          setLoading(false);
        });
      console.log({
        fromDateTime,
        toDateTime,
        numberPlate,
        vehicleType,
      });

      setConfirmPage(true);
    }
  };

  return (
    <>
      {loading && <LoadingIndicator />}
      {!loading && (
        <>
          <PageHeader title="Reserve Parking" setConfirmPage={setConfirmPage} />
          <div className="container bg-gray-200 min-h-screen flex flex-col items-center pb-28">
            <img src="/reservation-preview.png" alt="" />
            <form onSubmit={handleSubmit}>
              <FormInput
                placeholder="Display Name"
                type="text"
                name="display_name"
                label="Location"
                value={reservation.display_name}
                onChange={() => {}} // disable display name change
              />

              <CustomDateTimePicker
                onChange={(value) => {
                  setFromDateTime(value);
                  validateDates(); // Re-validate on change
                }}
                value={fromDateTime}
                label="From"
              />

              <CustomDateTimePicker
                onChange={(value) => {
                  setToDateTime(value);
                  validateDates(); // Re-validate on change
                }}
                value={toDateTime}
                label="To"
              />

              <FormInput
                placeholder="3467"
                type="number"
                name="numberPlate"
                label="Number Plate"
                value={numberPlate}
                maxLength={4}
                onChange={(e) => setNumberPlate(e.target.value)}
              />

              <FormSelect
                name="vehicleType"
                label="Vehicle Type"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                options={vehicleTypeOptions}
              />

              {error && <p className="text-red-500 mt-2">{error}</p>}

              <Button
                title="Reserve"
                styles="bg-primary text-white hover:bg-blue-700 transition-all duration-0 hover:duration-150 ease-in-out"
                disabled={!!error} // Disable button if there's an error
              />
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default ReserveParking;
