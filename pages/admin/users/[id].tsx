import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdArrowBack } from "react-icons/md";
import { IFormInput } from "./new";
import useSWRMutation from "swr/mutation";
import { deleteUser, updateUser } from "../../../lib/users";
import Spinner from "../../../components/atoms/spinner";
import Button from "../../../components/atoms/button";
import CircleButton from "../../../components/atoms/circleButton";
import MyDialog from "../../../components/modal";
import useSWR from "swr";
import { getUser } from "../../../lib/users";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Page(): ReactElement {
  const router = useRouter();
  const { id: userId } = router.query;

  //swr
  const { data: user, error: isError } = useSWR(
    `/${userId}` as string,
    getUser
  );
  const { trigger, isMutating } = useSWRMutation<IFormInput>(
    `/${userId}`,
    updateUser
  );

  // toastify
  const successUpdated = () => toast.success("User updated");
  const successDeleted = () => toast.success("User successfully deleted");
  const errorMutate = () => toast.error("Something went wrong");

  // form
  const { register, handleSubmit, setValue } = useForm<IFormInput>();
  const [disabled, setDisabled] = useState(true);
  let [isOpen, setIsOpen] = useState(false);

  // event handler
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      await trigger({ id: userId, ...data });
      successUpdated();
      setDisabled(true);
    } catch {
      errorMutate();
    }
  };

  const onClick = async () => {
    try {
      await deleteUser(`/${userId}` as string);
      successDeleted();
      router.push("/admin/users");
    } catch (e) {
      errorMutate();
    }
  };

  if ((!user && !isError) || isMutating) {
    return <Spinner />;
  }

  return (
    <>
      <MyDialog isOpen={isOpen} setIsOpen={setIsOpen} onClick={onClick} />
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 h-screen">
        <div>
          <div className="w-full bg-white h-1/6 p-10 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <CircleButton path="/admin/users">
                <MdArrowBack className="text-white text-2xl" />
              </CircleButton>
              <p className="text-2xl font-bold drop-shadow-md shadow-black">
                User account
              </p>
            </div>
            <div className="flex">
              <div className="mr-2">
                <Button type={"submit"} disabled={disabled}>
                  Update user
                </Button>
                <Button
                  type={"button"}
                  variant="danger"
                  onClick={() => setIsOpen(true)}
                >
                  Delete user
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 rounded-lg grid grid-cols-3 bg-white h-4/5 p-20">
          <div className="flex flex-col">
            <label htmlFor="first_name">First Name</label>
            <input
              {...register("first_name", { required: true, maxLength: 20 })}
              className="w-72 h-12 mr-10 mt-2 p-5 rounded bg-white border shadow-lg shadow-zinc-300 outline-none"
              onChange={(e) => {
                setDisabled(false);
                setValue("first_name", e.target.value);
              }}
              defaultValue={user.first_name}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="last_name">Last Name</label>
            <input
              {...register("last_name", {
                pattern: /^[A-Za-z]+$/i,
                required: true,
              })}
              className="w-72 h-12 mr-10 mt-2 p-5 rounded bg-white border shadow-lg shadow-zinc-300 outline-none"
              onChange={(e) => {
                setDisabled(false);
                setValue("last_name", e.target.value);
              }}
              defaultValue={user.last_name}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email">Email</label>
            <input
              {...register("email", { required: true })}
              type="email"
              className="w-72 h-12 mr-10 mt-2 p-5 rounded bg-white border shadow-lg shadow-zinc-300 outline-none"
              onChange={(e) => {
                setDisabled(false);
                setValue("email", e.target.value);
              }}
              defaultValue={user.email}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="role">Role</label>
            <select
              {...register("role")}
              className="w-72 h-12 mr-10 mt-2 pl-2 rounded bg-white border shadow-lg shadow-zinc-300 outline-none"
              defaultValue={user.role}
              onChange={(e) => {
                setDisabled(false);
                setValue("role", e.target.value);
              }}
            >
              <option value="ADMIN">Admin</option>
              <option value="DEV">Developper</option>
            </select>
          </div>
        </div>
      </form>
    </>
  );
}
