import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [isUserFetched, setIsUserFetched] = useState(false);

  const getUser = async () => {
    try {
      dispatch(showLoading());

      const res = await axios.post(
        "/api/v1/user/getUserData",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());

      if (res.data.success) {
        dispatch(setUser(res.data.data));
      } else {
        localStorage.clear();
        navigate("/login");
      }
    } catch (error) {
      console.log("getUser error:", error.response?.data || error.message);
      localStorage.clear();
      dispatch(hideLoading());
      navigate("/login");
    } finally {
      setIsUserFetched(true);
    }
  };

  useEffect(() => {
    if (!user && localStorage.getItem("token")) {
      getUser();
    } else {
      setIsUserFetched(true);
    }
  }, [user]);

  // No token at all
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }

  // User data still being fetched
  if (!isUserFetched) {
    return <div>Loading user...</div>; // or use <Spinner />
  }

  return children;
}
