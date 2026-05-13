import Swal from "sweetalert2";

export const confirmAlert = async (message, title = "Are you sure?") => {
  const result = await Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc3545",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const deleteConfirmAlert = async (itemName = "this item") => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Delete?",
    text: `Are you sure you want to delete ${itemName}? This cannot be undone.`,
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc3545",
    reverseButtons: true,
  });
  return result.isConfirmed;
};
