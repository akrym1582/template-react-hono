import Swal from "sweetalert2";
import { getApiErrorMessage } from "./api-error.js";

export async function showErrorPopup(error: unknown) {
  await Swal.fire({
    icon: "error",
    title: "Error",
    text: getApiErrorMessage(error),
    confirmButtonText: "OK",
  });
}
