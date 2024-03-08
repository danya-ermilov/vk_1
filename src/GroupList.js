import React, { useState, useEffect } from "react";
import axios from "axios";
//import { Card, Button } from "react-bootstrap"; // не получилось :-(

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [privacyFilter, setPrivacyFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("any");
  const [friendFilter, setFriendFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendVisibility, setFriendVisibility] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Имитация задержки в 1 секунду
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const response = await axios.get("/groups.json");

        if (response.data.result === 1 && response.data.data) {
          setGroups(response.data.data);
        } else {
          throw new Error("Ошибка получения данных");
        }

        setLoading(false);
      } catch (error) {
        setError("Ошибка получения данных");
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const uniqueColors = [
    ...new Set(
      groups
        .map((group) => {
          if (group.avatar_color) {
            return group.avatar_color;
          }
        })
        .filter((color) => color !== undefined)
    ),
  ];

  const filteredGroups = groups.filter((group) => {
    // Применяем фильтры
    return (
      (privacyFilter === "all" ||
        (privacyFilter === "closed" && group.closed) ||
        (privacyFilter === "open" && !group.closed)) &&
      (colorFilter === "any" || colorFilter === group.avatar_color) &&
      (!friendFilter ||
        (friendFilter && group.friends && group.friends.length > 0))
    );
  });

  const toggleFriendVisibility = (groupId) => {
    setFriendVisibility((prevState) => ({
      ...prevState,
      [groupId]: !prevState[groupId],
    }));
  };

  const renderFriends = (friends) => {
    if (!friends) return null;
    return friends.map((friend, index) => (
      <div key={index}>
        {friend.first_name} {friend.last_name}
      </div>
    ));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div>
        <label>
          Тип приватности:
          <select
            value={privacyFilter}
            onChange={(e) => setPrivacyFilter(e.target.value)}
          >
            <option value="all">Все</option>
            <option value="closed">Закрытый</option>
            <option value="open">Открытый</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Цвет аватарки:
          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
          >
            <option value="any">все</option>
            {uniqueColors.map((color, index) => (
              <option key={index} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Наличие друзей в группе:
          <input
            type="checkbox"
            checked={friendFilter}
            onChange={(e) => setFriendFilter(e.target.checked)}
          />
        </label>
      </div>
      {filteredGroups.map((group) => (
        <div key={group.id}>
          <div>
            <h3>{group.name}</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {group.avatar_color && (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: group.avatar_color,
                    justifyContent: "center",
                  }}
                />
              )}
            </div>
          </div>

          <p>{group.closed ? "Закрытый" : "Открытый"}</p>
          <p>кол-во подписчиков: {group.members_count}</p>
          {group.friends && (
            <div>
              <button onClick={() => toggleFriendVisibility(group.id)}>
                <div>кол-во друзей:{group.friends.length}</div>
              </button>
              {friendVisibility[group.id] && (
                <div>{renderFriends(group.friends)}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default GroupList;
