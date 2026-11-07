import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatRelativeTime } from "../../utils/dateUtils";

const NotificationBell = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_MY);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 60000);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((current) => !current);
    if (!open) fetchNotifications();
  };

  const markAllRead = async () => {
    try {
      await axiosInstance.patch(API_PATHS.NOTIFICATIONS.MARK_ALL_READ);
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const openNotification = async (notification) => {
    try {
      if (!notification.read) {
        await axiosInstance.patch(API_PATHS.NOTIFICATIONS.MARK_READ(notification._id));
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    } finally {
      setOpen(false);
      fetchNotifications();
      if (notification.link) navigate(notification.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Same height, border and radius as the profile button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#0a1f6b]/15 bg-white/60 shadow-[0_1px_2px_rgba(10,31,107,0.08)] transition-colors hover:bg-white/85 text-[#0a1f6b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
        aria-label={
          unreadCount
            ? `Open notifications, ${unreadCount} unread`
            : "Open notifications"
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffd23f] ring-2 ring-white px-1 text-[10px] font-extrabold leading-none text-[#0a1f6b]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white shadow-[0_24px_48px_-16px_rgba(10,31,107,0.35)]">
          {/* Header matches the profile menu header */}
          <div className="flex items-center justify-between gap-3 bg-[#1646e0] px-4 py-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <p className="text-xs text-white/80">
                {unreadCount
                  ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                  : "All caught up"}
              </p>
            </div>

            <button
              type="button"
              onClick={markAllRead}
              disabled={!unreadCount}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:text-white/40 disabled:hover:bg-transparent"
            >
              <CheckCheck className="h-4 w-4" />
              Read all
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3ff] text-[#1646e0]">
                  <Inbox className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-bold text-[#0a1f6b]">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Application updates will show here.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    role="menuitem"
                    onClick={() => openNotification(notification)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1646e0] ${
                      notification.read
                        ? "bg-white hover:bg-[#eef3ff]"
                        : "bg-[#eef3ff] hover:bg-[#dbe6ff]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                          notification.read ? "bg-slate-200" : "bg-[#1646e0]"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#0a1f6b]">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-slate-400">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;