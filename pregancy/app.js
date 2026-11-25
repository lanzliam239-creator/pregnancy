document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.getAttribute("data-page");

  // =========================================================
  // 0. STORAGE KEYS & DEFAULT DATA
  // =========================================================
  const USERS_KEY = "pw_registered_users";
  const SESSION_KEY = "pw_current_user";
  const PROFILE_KEY = "pw_user_profile";
  const TRACKER_KEY = "pw_usage_tracker";
  const BLOCKS_KEY = "pw_blocked_accounts";
  const CONTENT_KEY = "pw_topic_contents";

  const ADMIN_ACCOUNT = {
    username: "admin",
    password: "admin123",
    role: "admin"
  };

  const defaultTopicContents = {
    "about-pregnancy": {
      title: "About Pregnancy",
      intro: "Pregnancy typically lasts about 40 weeks from the first day of your last menstrual period and is divided into three trimesters. Understanding how your body changes helps you stay healthy and prepared.",
      blocks: [
        {
          heading: "First Trimester (Weeks 1–12)",
          body: "Major organs begin forming. Common symptoms include fatigue, nausea (morning sickness), and breast tenderness. Begin taking 400 mcg of folic acid daily."
        },
        {
          heading: "Second Trimester (Weeks 13–26)",
          body: "Often called the most comfortable stage. Energy usually returns, your baby bump becomes visible, and you may feel your baby's first movements around weeks 18–20."
        },
        {
          heading: "Third Trimester (Weeks 27–40)",
          body: "Rapid fetal weight gain and lung maturation occur. Schedule bi-weekly then weekly prenatal visits, and watch for warning signs like severe headaches, blurred vision, or decreased fetal movement."
        }
      ]
    },
    "first-time-mom": {
      title: "First-Time Mom Guide",
      intro: "Becoming a mother for the first time brings excitement and plenty of questions. Use this step-by-step roadmap to stay organized from your first positive test to delivery day.",
      blocks: [
        {
          heading: "1. Early Prenatal Checkups",
          body: "Register early at your local Barangay Health Station or OB-GYN clinic for blood pressure screening, ultrasound, and iron/folate supplements."
        },
        {
          heading: "2. Balanced Nutrition & Hydration",
          body: "Eat iron-rich greens, lean protein, calcium, and whole grains. Drink 8–10 glasses of water daily and avoid raw seafood or unpasteurized dairy."
        },
        {
          heading: "3. Hospital Bag Checklist (Week 34)",
          body: "Pack valid IDs, PhilHealth/health records, comfortable front-button clothes, maternity pads, baby onesies, diapers, and receiving blankets."
        }
      ]
    },
    "teenage-pregnancy": {
      title: "Teenage Pregnancy Support",
      intro: "If you are a teenager facing an unplanned or early pregnancy, you deserve compassionate, confidential medical care without judgment. Early prenatal support protects both your health and your baby's future.",
      blocks: [
        {
          heading: "Why Early Checkups Matter Most",
          body: "Teenagers have higher risks for anemia and high blood pressure during pregnancy. Regular checkups and iron supplements keep both you and your baby safe."
        },
        {
          heading: "Confidential Nurse Consultation",
          body: "Not ready to visit a clinic alone? Use our Messages tab to talk directly with Nurse Clarissa Reyes, RN for private guidance."
        },
        {
          heading: "Your Right to Education",
          body: "Schools and Alternative Learning Systems (ALS) provide flexible modules and support so young mothers can finish high school or college."
        }
      ]
    }
  };

  const getUsers = () => {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) return JSON.parse(saved);
    const defaultUsers = [
      { username: "mom_jane", phone: "09170001111", password: "123456" }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const getCurrentUser = () => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  };

  const getBlocks = () => {
    const raw = localStorage.getItem(BLOCKS_KEY);
    return raw ? JSON.parse(raw) : {};
  };

  const saveBlocks = (blocks) => localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));

  const getTracker = () => {
    const raw = localStorage.getItem(TRACKER_KEY);
    if (raw) return JSON.parse(raw);
    const initial = { totalVisits: 1, userStats: {} };
    localStorage.setItem(TRACKER_KEY, JSON.stringify(initial));
    return initial;
  };

  const saveTracker = (tracker) => localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));

  const getTopicContents = () => {
    const raw = localStorage.getItem(CONTENT_KEY);
    return raw ? JSON.parse(raw) : defaultTopicContents;
  };

  const saveTopicContents = (data) => localStorage.setItem(CONTENT_KEY, JSON.stringify(data));

  const getProfile = () => {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
    const session = getCurrentUser();
    return {
      fullName: "",
      age: "",
      address: "",
      phone: session && session.phone ? session.phone : "",
      sex: "",
      isPregnant: false,
      avatarType: "initials",
      avatarValue: session ? session.username.slice(0, 2).toUpperCase() : "PW"
    };
  };

  const saveProfile = (profileData) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
  };

  // Record visit & active user usage on every page load
  const recordUsage = () => {
    const tracker = getTracker();
    tracker.totalVisits = (tracker.totalVisits || 0) + 1;
    const session = getCurrentUser();
    if (session && session.role !== "admin") {
      const key = session.username.toLowerCase();
      const prev = tracker.userStats[key] || { sessions: 0, lastActive: "" };
      tracker.userStats[key] = {
        sessions: prev.sessions + 1,
        lastActive: new Date().toLocaleString()
      };
    }
    saveTracker(tracker);
  };
  recordUsage();

  // Render dynamic content inside Topic HTML pages (about-pregnancy, first-time-mom, teenage-pregnancy)
  if (["about-pregnancy", "first-time-mom", "teenage-pregnancy"].includes(currentPage)) {
    const allContents = getTopicContents();
    const topicData = allContents[currentPage];
    if (topicData) {
      const articleEl = document.querySelector("main article");
      if (articleEl) {
        const headingEl = articleEl.querySelector("h2");
        const introEl = articleEl.querySelector("article > p");
        if (headingEl) headingEl.textContent = topicData.title;
        if (introEl) introEl.textContent = topicData.intro;

        const blockContainers = articleEl.querySelectorAll(".rounded-xl");
        topicData.blocks.forEach((blk, idx) => {
          if (blockContainers[idx]) {
            const h3 = blockContainers[idx].querySelector("h3");
            const p = blockContainers[idx].querySelector("p");
            if (h3) h3.textContent = blk.heading;
            if (p) p.textContent = blk.body;
          }
        });
      }
    }
  }

  // =========================================================
  // 1. SIDEBAR ACCOUNT, PROFILE & LOG OUT BOX
  // =========================================================
  const sidebarAuthBox = document.getElementById("sidebar-auth-box");
  const renderSidebarAuth = () => {
    if (!sidebarAuthBox) return;
    const user = getCurrentUser();
    const profile = getProfile();
    const isAdmin = user && user.role === "admin";
    const displayLabel = isAdmin
      ? `🛡️ Admin (${user.username})`
      : `👤 ${profile.fullName || (user ? user.username : "Guest User")}`;
    const statusLabel = isAdmin
      ? "Administrator Session"
      : user
      ? (profile.isPregnant ? "🤰 Expecting" : "Logged In")
      : "Not Logged In";

    sidebarAuthBox.innerHTML = `
      <div class="sidebar-account-card">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-900 truncate">${escapeHTML(displayLabel)}</p>
            <p class="text-[11px] text-slate-500 truncate">${escapeHTML(statusLabel)}</p>
          </div>
          <button id="logout-btn" type="button" class="sidebar-logout-btn shrink-0">
            Log Out
          </button>
        </div>
        ${!isAdmin ? `
          <a href="profile.html" class="sidebar-profile-btn">
            <span>🪪</span> Check My Profile
          </a>
        ` : `
          <a href="admin-dashboard.html" class="sidebar-profile-btn">
            <span>📊</span> Admin Dashboard
          </a>
        `}
        ${!user ? `
          <div class="grid grid-cols-2 gap-1.5 mt-2">
            <a href="login.html" class="flex items-center justify-center rounded-lg bg-rose-600 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700 transition">
              Log In
            </a>
            <a href="register.html" class="flex items-center justify-center rounded-lg bg-rose-100 px-2 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-200 transition">
              Register
            </a>
          </div>
        ` : ""}
      </div>
    `;

    document.getElementById("logout-btn")?.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "login.html";
    });
  };
  renderSidebarAuth();

  // =========================================================
  // 2. TWO-WAY LOGIN (ADMIN vs USER), REGISTER & RESET PASSWORD
  // =========================================================
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const resetForm = document.getElementById("reset-form");
  const authAlert = document.getElementById("auth-alert");

  const showAuthAlert = (message, type = "error") => {
    if (!authAlert) return;
    authAlert.textContent = message;
    authAlert.className = `mb-5 rounded-xl p-3.5 text-xs font-medium ${
      type === "success" ? "auth-alert-success" : "auth-alert-error"
    }`;
  };

  if (loginForm) {
    const phoneWrapper = document.getElementById("login-phone-wrapper");
    const phoneInput = document.getElementById("login-phone");
    const forgotLink = document.getElementById("forgot-password-link");
    const submitBtn = document.getElementById("login-submit-btn");

    const syncRoleUI = () => {
      const selectedRole = document.querySelector('input[name="login-role"]:checked')?.value || "user";
      if (selectedRole === "admin") {
        // Admin login bypasses user phone/forgot-password flow and goes to admin portal
        if (phoneWrapper) phoneWrapper.classList.add("hidden");
        if (phoneInput) phoneInput.required = false;
        if (forgotLink) forgotLink.classList.add("hidden");
        if (submitBtn) submitBtn.textContent = "Log In as Admin";
      } else {
        if (phoneWrapper) phoneWrapper.classList.remove("hidden");
        if (phoneInput) phoneInput.required = true;
        if (forgotLink) forgotLink.classList.remove("hidden");
        if (submitBtn) submitBtn.textContent = "Log In as User";
      }
    };

    document.querySelectorAll('input[name="login-role"]').forEach((radio) => {
      radio.addEventListener("change", syncRoleUI);
    });
    syncRoleUI();

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const role = document.querySelector('input[name="login-role"]:checked')?.value || "user";
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;

      if (role === "admin") {
        if (
          username.toLowerCase() === ADMIN_ACCOUNT.username &&
          password === ADMIN_ACCOUNT.password
        ) {
          localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ username: ADMIN_ACCOUNT.username, role: "admin" })
          );
          showAuthAlert("Admin verified! Opening Admin Portal...", "success");
          setTimeout(() => {
            window.location.href = "admin-dashboard.html";
          }, 600);
          return;
        }
        return showAuthAlert("Invalid Admin username or password.");
      }

      // User two-way branch: requires Username + Phone Number + Password & checks block status
      const phone = phoneInput ? phoneInput.value.trim() : "";
      const users = getUsers();
      const matchedUser = users.find(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() &&
          u.phone === phone &&
          u.password === password
      );

      if (!matchedUser) {
        return showAuthAlert("Invalid username, phone number, or password.");
      }

      const blocks = getBlocks();
      const blockInfo = blocks[matchedUser.username.toLowerCase()];
      if (blockInfo) {
        const blockKind = blockInfo.type === "permanent" ? "PERMANENTLY BLOCKED" : "TEMPORARILY BLOCKED";
        return showAuthAlert(
          `Your account is ${blockKind}. Reason/Consequence: ${blockInfo.reason}`
        );
      }

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ username: matchedUser.username, phone: matchedUser.phone, role: "user" })
      );
      showAuthAlert("User login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 700);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("reg-username").value.trim();
      const phone = document.getElementById("reg-phone").value.trim();
      const password = document.getElementById("reg-password").value;
      const confirmPassword = document.getElementById("reg-confirm-password").value;

      if (password !== confirmPassword) {
        return showAuthAlert("Passwords do not match. Please try again.");
      }

      const users = getUsers();
      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        return showAuthAlert("That username is already taken. Please choose another.");
      }

      users.push({ username, phone, password });
      saveUsers(users);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ username, phone, role: "user" }));
      saveProfile({
        fullName: "",
        age: "",
        address: "",
        phone,
        sex: "",
        isPregnant: false,
        avatarType: "initials",
        avatarValue: username.slice(0, 2).toUpperCase()
      });

      showAuthAlert("Account created! Redirecting to Pregnancy Wiki...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 900);
    });
  }

  if (resetForm) {
    resetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("reset-username").value.trim();
      const phone = document.getElementById("reset-phone").value.trim();
      const newPassword = document.getElementById("reset-new-password").value;
      const confirmNewPassword = document.getElementById("reset-confirm-password").value;

      if (newPassword !== confirmNewPassword) {
        return showAuthAlert("New passwords do not match.");
      }

      const users = getUsers();
      const userIndex = users.findIndex(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.phone === phone
      );

      if (userIndex === -1) {
        return showAuthAlert("No account found matching that username and phone number.");
      }

      users[userIndex].password = newPassword;
      saveUsers(users);
      resetForm.reset();

      showAuthAlert("Password reset successfully! Redirecting to Log In...", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    });
  }

  // =========================================================
  // 3. ADMIN USER TRACKER (admin-dashboard.html)
  // =========================================================
  const adminUsersTableBody = document.getElementById("admin-users-table-body");
  if (adminUsersTableBody) {
    const users = getUsers();
    const blocks = getBlocks();
    const tracker = getTracker();

    const blockedCount = users.filter((u) => Boolean(blocks[u.username.toLowerCase()])).length;
    const activeCount = users.length - blockedCount;

    const totalUsersEl = document.getElementById("stat-total-users");
    const totalVisitsEl = document.getElementById("stat-total-visits");
    const activeUsersEl = document.getElementById("stat-active-users");
    const blockedUsersEl = document.getElementById("stat-blocked-users");

    if (totalUsersEl) totalUsersEl.textContent = users.length;
    if (totalVisitsEl) totalVisitsEl.textContent = tracker.totalVisits || 0;
    if (activeUsersEl) activeUsersEl.textContent = activeCount;
    if (blockedUsersEl) blockedUsersEl.textContent = blockedCount;

    adminUsersTableBody.innerHTML = users
      .map((u) => {
        const key = u.username.toLowerCase();
        const stat = tracker.userStats[key] || { sessions: 0, lastActive: "Not yet logged in" };
        const block = blocks[key];
        const statusHtml = block
          ? `<span class="profile-badge profile-badge-yes">${block.type === "permanent" ? "Permanent Block" : "Temporary Block"}</span>`
          : `<span class="profile-badge" style="background:#dcfce7;color:#15803d;">Active</span>`;

        return `
          <tr>
            <td class="py-3 pr-4 font-bold text-slate-900">${escapeHTML(u.username)}</td>
            <td class="py-3 px-4 text-slate-600">${escapeHTML(u.phone)}</td>
            <td class="py-3 px-4 font-semibold text-slate-800">${stat.sessions}</td>
            <td class="py-3 px-4 text-xs text-slate-500">${escapeHTML(stat.lastActive)}</td>
            <td class="py-3 pl-4">${statusHtml}</td>
          </tr>
        `;
      })
      .join("");
  }

  // =========================================================
  // 4. ADMIN CONTAINER CONTENT EDITOR (admin-content.html)
  // =========================================================
  const adminContentForm = document.getElementById("admin-content-form");
  if (adminContentForm) {
    const topicSelect = document.getElementById("content-topic-select");
    const titleInput = document.getElementById("content-title");
    const introInput = document.getElementById("content-intro");
    const b1h = document.getElementById("block-1-heading");
    const b1b = document.getElementById("block-1-body");
    const b2h = document.getElementById("block-2-heading");
    const b2b = document.getElementById("block-2-body");
    const b3h = document.getElementById("block-3-heading");
    const b3b = document.getElementById("block-3-body");
    const alertBox = document.getElementById("admin-content-alert");

    const loadTopicIntoEditor = (topicKey) => {
      const all = getTopicContents();
      const item = all[topicKey] || defaultTopicContents[topicKey];
      titleInput.value = item.title;
      introInput.value = item.intro;
      b1h.value = item.blocks[0]?.heading || "";
      b1b.value = item.blocks[0]?.body || "";
      b2h.value = item.blocks[1]?.heading || "";
      b2b.value = item.blocks[1]?.body || "";
      b3h.value = item.blocks[2]?.heading || "";
      b3b.value = item.blocks[2]?.body || "";
    };

    loadTopicIntoEditor(topicSelect.value);
    topicSelect.addEventListener("change", () => loadTopicIntoEditor(topicSelect.value));

    adminContentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const key = topicSelect.value;
      const all = getTopicContents();
      all[key] = {
        title: titleInput.value.trim(),
        intro: introInput.value.trim(),
        blocks: [
          { heading: b1h.value.trim(), body: b1b.value.trim() },
          { heading: b2h.value.trim(), body: b2b.value.trim() },
          { heading: b3h.value.trim(), body: b3b.value.trim() }
        ]
      };
      saveTopicContents(all);

      if (alertBox) {
        alertBox.textContent = `Saved changes for "${all[key].title}"! Open that page to see the updated container content.`;
        alertBox.className = "rounded-xl p-3.5 text-xs font-medium auth-alert-success";
      }
    });

    document.getElementById("reset-default-content-btn")?.addEventListener("click", () => {
      const key = topicSelect.value;
      const all = getTopicContents();
      all[key] = defaultTopicContents[key];
      saveTopicContents(all);
      loadTopicIntoEditor(key);
      if (alertBox) {
        alertBox.textContent = "Restored default content for this container.";
        alertBox.className = "rounded-xl p-3.5 text-xs font-medium auth-alert-success";
      }
    });
  }

  // =========================================================
  // 5. ADMIN ACCOUNT BLOCKING & UNBLOCKING (admin-blocking.html)
  // =========================================================
  const blockForm = document.getElementById("block-account-form");
  const blockingListEl = document.getElementById("blocking-accounts-list");
  if (blockForm && blockingListEl) {
    const targetSelect = document.getElementById("block-target-username");
    const blockTypeSelect = document.getElementById("block-type");
    const blockReasonInput = document.getElementById("block-reason");
    const blockingAlert = document.getElementById("blocking-alert");

    const showBlockAlert = (msg, type = "success") => {
      if (!blockingAlert) return;
      blockingAlert.textContent = msg;
      blockingAlert.className = `rounded-xl p-3.5 text-xs font-medium ${
        type === "success" ? "auth-alert-success" : "auth-alert-error"
      }`;
    };

    const renderBlockingSection = () => {
      const users = getUsers();
      const blocks = getBlocks();

      targetSelect.innerHTML = users
        .map((u) => `<option value="${escapeHTML(u.username)}">${escapeHTML(u.username)} (${escapeHTML(u.phone)})</option>`)
        .join("");

      blockingListEl.innerHTML = users
        .map((u) => {
          const key = u.username.toLowerCase();
          const b = blocks[key];
          return `
            <div class="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-bold text-sm text-slate-900">${escapeHTML(u.username)}</span>
                  <span class="text-xs text-slate-400">📱 ${escapeHTML(u.phone)}</span>
                  ${
                    b
                      ? `<span class="profile-badge profile-badge-yes">${b.type === "permanent" ? "🔒 Permanently Blocked" : "⏳ Temporarily Blocked"}</span>`
                      : `<span class="profile-badge" style="background:#dcfce7;color:#15803d;">✅ Unblocked / Active</span>`
                  }
                </div>
                ${b ? `<p class="text-xs text-red-700 mt-1">Consequence / Reason: ${escapeHTML(b.reason)}</p>` : ""}
              </div>

              <div class="flex items-center gap-2 shrink-0">
                ${
                  b
                    ? `<button type="button" data-unblock-user="${escapeHTML(key)}" class="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition">Remove Block</button>`
                    : `<button type="button" data-quick-perm-block="${escapeHTML(key)}" class="rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 transition">Block Permanently</button>`
                }
              </div>
            </div>
          `;
        })
        .join("");

      blockingListEl.querySelectorAll("[data-unblock-user]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-unblock-user");
          const updatedBlocks = getBlocks();
          delete updatedBlocks[key];
          saveBlocks(updatedBlocks);
          renderBlockingSection();
          showBlockAlert(`Block removed for "${key}". The account can now log in again.`);
        });
      });

      blockingListEl.querySelectorAll("[data-quick-perm-block]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-quick-perm-block");
          const updatedBlocks = getBlocks();
          updatedBlocks[key] = {
            type: "permanent",
            reason: "Blocked permanently by administrator."
          };
          saveBlocks(updatedBlocks);
          renderBlockingSection();
          showBlockAlert(`"${key}" has been permanently blocked.`, "error");
        });
      });
    };

    blockForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = targetSelect.value.trim();
      const key = username.toLowerCase();
      const type = blockTypeSelect.value;
      const reason = blockReasonInput.value.trim();

      const updatedBlocks = getBlocks();
      updatedBlocks[key] = { type, reason };
      saveBlocks(updatedBlocks);
      blockReasonInput.value = "";
      renderBlockingSection();
      showBlockAlert(
        `Applied ${type} block to "${username}".`,
        type === "permanent" ? "error" : "success"
      );
    });

    renderBlockingSection();
  }

  // =========================================================
  // 6. USER PROFILE SECTION (profile.html)
  // =========================================================
  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    let draftProfile = getProfile();
    const activeUser = getCurrentUser();

    const renderAvatarInto = (el, prof) => {
      if (!el) return;
      if (prof.avatarType === "image" && prof.avatarValue) {
        el.innerHTML = `<img src="${escapeHTML(prof.avatarValue)}" alt="Profile Picture" />`;
      } else {
        el.textContent = prof.avatarValue || "PW";
      }
    };

    const renderProfileView = (prof) => {
      const displayFullname = document.getElementById("display-fullname");
      const displaySex = document.getElementById("display-sex");
      const badge = document.getElementById("display-pregnant-badge");
      const summaryFullname = document.getElementById("summary-fullname");
      const summaryAge = document.getElementById("summary-age");
      const summaryAddress = document.getElementById("summary-address");
      const summaryPhone = document.getElementById("summary-phone");

      renderAvatarInto(document.getElementById("profile-avatar-display"), prof);
      renderAvatarInto(document.getElementById("edit-avatar-preview"), prof);

      if (displayFullname) {
        displayFullname.textContent = prof.fullName || (activeUser ? activeUser.username : "Guest User");
      }
      if (displaySex) {
        displaySex.textContent = prof.sex ? `Sex: ${prof.sex}` : "Sex: Not specified";
      }
      if (badge) {
        if (prof.isPregnant) {
          badge.className = "profile-badge profile-badge-yes";
          badge.textContent = "🤰 Pregnant: Yes";
        } else {
          badge.className = "profile-badge profile-badge-no";
          badge.textContent = "Pregnant: No / Unchecked";
        }
      }

      if (summaryFullname) summaryFullname.textContent = prof.fullName || "Not provided (optional)";
      if (summaryAge) summaryAge.textContent = prof.age ? `${prof.age} years old` : "Not provided (optional)";
      if (summaryAddress) summaryAddress.textContent = prof.address || "Not provided (optional)";
      if (summaryPhone) summaryPhone.textContent = prof.phone || "Not provided (optional)";
    };

    const populateEditInputs = (prof) => {
      document.getElementById("profile-fullname").value = prof.fullName || "";
      document.getElementById("profile-age").value = prof.age || "";
      document.getElementById("profile-address").value = prof.address || "";
      document.getElementById("profile-phone").value = prof.phone || "";
      document.getElementById("profile-pregnant").checked = Boolean(prof.isPregnant);

      document.querySelectorAll('input[name="profile-sex"]').forEach((radio) => {
        radio.checked = radio.value === prof.sex;
      });
    };

    renderProfileView(draftProfile);
    populateEditInputs(draftProfile);

    document.getElementById("toggle-edit-profile-btn")?.addEventListener("click", () => {
      document.getElementById("edit-profile-section")?.scrollIntoView({ behavior: "smooth" });
      document.getElementById("profile-fullname")?.focus();
    });

    document.getElementById("profile-photo-input")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        draftProfile.avatarType = "image";
        draftProfile.avatarValue = reader.result;
        renderAvatarInto(document.getElementById("edit-avatar-preview"), draftProfile);
      };
      reader.readAsDataURL(file);
    });

    document.querySelectorAll(".preset-avatar-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        draftProfile.avatarType = "emoji";
        draftProfile.avatarValue = btn.getAttribute("data-preset-avatar");
        document.getElementById("profile-photo-input").value = "";
        renderAvatarInto(document.getElementById("edit-avatar-preview"), draftProfile);
      });
    });

    document.getElementById("remove-photo-btn")?.addEventListener("click", () => {
      draftProfile.avatarType = "initials";
      draftProfile.avatarValue = activeUser ? activeUser.username.slice(0, 2).toUpperCase() : "PW";
      document.getElementById("profile-photo-input").value = "";
      renderAvatarInto(document.getElementById("edit-avatar-preview"), draftProfile);
    });

    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectedSex = document.querySelector('input[name="profile-sex"]:checked');

      draftProfile = {
        ...draftProfile,
        fullName: document.getElementById("profile-fullname").value.trim(),
        age: document.getElementById("profile-age").value.trim(),
        address: document.getElementById("profile-address").value.trim(),
        phone: document.getElementById("profile-phone").value.trim(),
        sex: selectedSex ? selectedSex.value : "",
        isPregnant: document.getElementById("profile-pregnant").checked
      };

      saveProfile(draftProfile);
      renderProfileView(draftProfile);
      renderSidebarAuth();

      const alertBox = document.getElementById("profile-alert");
      if (alertBox) {
        alertBox.textContent = "Your profile has been updated!";
        alertBox.className = "mb-5 rounded-xl p-3.5 text-xs font-medium auth-alert-success";
      }
    });
  }

  // =========================================================
  // 7. HIGHLIGHT ACTIVE SIDEBAR LINK & MOBILE DRAWER
  // =========================================================
  document.querySelectorAll(".nav-link").forEach((link) => {
    const navTarget = link.getAttribute("data-nav");
    if (
      navTarget === currentPage ||
      (["about-pregnancy", "first-time-mom", "teenage-pregnancy"].includes(currentPage) && navTarget === "home")
    ) {
      link.classList.add("active");
    }
  });

  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const sidebar = document.getElementById("sidebar");
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("-translate-x-full");
    });
  }

  // Auto-fill logged-in name in Comment & News Feed inputs
  const activeUser = getCurrentUser();
  const activeProfile = getProfile();
  const preferredAuthor = activeProfile.fullName || (activeUser ? activeUser.username : "");
  if (preferredAuthor) {
    const commentAuthorInput = document.getElementById("comment-author");
    const feedAuthorInput = document.getElementById("feed-author");
    if (commentAuthorInput && !commentAuthorInput.value) commentAuthorInput.value = preferredAuthor;
    if (feedAuthorInput && !feedAuthorInput.value) feedAuthorInput.value = preferredAuthor;
  }

  // =========================================================
  // 8. TOPIC COMMENT SECTIONS (All 3 Topic HTML Pages)
  // =========================================================
  const commentForm = document.getElementById("comment-form");
  const commentsList = document.getElementById("comments-list");
  const commentCount = document.getElementById("comment-count");

  const defaultComments = {
    "about-pregnancy": [
      { author: "Andrea M.", time: "2 hours ago", text: "Tracking each trimester helped me understand why I felt so tired during week 8. Thank you for this clear guide!" },
      { author: "Camille S.", time: "Yesterday", text: "Reminder to fellow moms: never skip your folic acid and iron tablets!" }
    ],
    "first-time-mom": [
      { author: "Bea L.", time: "3 hours ago", text: "Packing my hospital bag at 34 weeks saved us so much stress when my water broke early." },
      { author: "Trisha R.", time: "2 days ago", text: "Having a checklist for prenatal vitamins and questions for my OB made my first visit super smooth." }
    ],
    "teenage-pregnancy": [
      { author: "Anonymous Youth", time: "5 hours ago", text: "I was scared to go to the barangay clinic at first, but messaging Nurse Clarissa helped me prepare." },
      { author: "Ate Jessa", time: "1 day ago", text: "Sending strength to all young moms! You can still finish your studies—ask about ALS programs." }
    ]
  };

  if (commentForm && commentsList) {
    const topic = commentForm.getAttribute("data-topic");
    const storageKey = `pw_comments_${topic}`;

    const getComments = () => {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultComments[topic] || [];
    };

    const renderComments = () => {
      const comments = getComments();
      if (commentCount) commentCount.textContent = comments.length;
      commentsList.innerHTML = comments
        .map(
          (c) => `
          <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <div class="flex items-center justify-between mb-1.5">
              <span class="font-semibold text-sm text-slate-900">${escapeHTML(c.author)}</span>
              <span class="text-xs text-slate-400">${escapeHTML(c.time)}</span>
            </div>
            <p class="text-sm text-slate-600 leading-relaxed">${escapeHTML(c.text)}</p>
          </div>
        `
        )
        .join("");
    };

    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const authorInput = document.getElementById("comment-author");
      const textInput = document.getElementById("comment-text");
      const text = textInput.value.trim();
      if (!text) return;

      const loggedIn = getCurrentUser();
      const prof = getProfile();
      const fallbackName = prof.fullName || (loggedIn ? loggedIn.username : "Anonymous Mom");
      const author = authorInput.value.trim() || fallbackName;
      const updated = [{ author, time: "Just now", text }, ...getComments()];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      textInput.value = "";
      renderComments();
    });

    renderComments();
  }

  // =========================================================
  // 9. COMMUNITY NEWS FEED (news-feed.html)
  // =========================================================
  const feedForm = document.getElementById("feed-post-form");
  const feedList = document.getElementById("feed-list");

  const defaultPosts = [
    {
      author: "Nurse Clarissa Reyes, RN",
      badge: "Healthcare Worker",
      time: "1 hour ago",
      content: "Free prenatal checkups, tetanus toxoid vaccines, and iron-folate supplements are available every Wednesday morning at the Municipal Rural Health Unit. Bring your Mother & Child Book!"
    },
    {
      author: "Maria Elena D.",
      badge: "First-Time Mom",
      time: "4 hours ago",
      content: "Just had my 20-week congenital anomaly scan today and heard my baby's heartbeat clearly. Praying for a safe delivery for everyone here!"
    }
  ];

  if (feedForm && feedList) {
    const feedKey = "pw_news_feed";
    const getPosts = () => {
      const saved = localStorage.getItem(feedKey);
      return saved ? JSON.parse(saved) : defaultPosts;
    };

    const renderFeed = () => {
      const posts = getPosts();
      feedList.innerHTML = posts
        .map(
          (p) => `
          <article class="rounded-2xl bg-white border border-rose-100 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">${escapeHTML(p.author.slice(0, 2).toUpperCase())}</div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-sm text-slate-900">${escapeHTML(p.author)}</h4>
                    <span class="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">${escapeHTML(p.badge)}</span>
                  </div>
                  <span class="text-xs text-slate-400">${escapeHTML(p.time)}</span>
                </div>
              </div>
            </div>
            <p class="text-sm text-slate-700 leading-relaxed">${escapeHTML(p.content)}</p>
          </article>
        `
        )
        .join("");
    };

    feedForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const loggedIn = getCurrentUser();
      const prof = getProfile();
      const fallbackName = prof.fullName || (loggedIn ? loggedIn.username : "Community Member");
      const author = document.getElementById("feed-author").value.trim() || fallbackName;
      const contentEl = document.getElementById("feed-content");
      const content = contentEl.value.trim();
      if (!content) return;

      const updated = [{ author, badge: loggedIn ? "Verified Member" : "Community", time: "Just now", content }, ...getPosts()];
      localStorage.setItem(feedKey, JSON.stringify(updated));
      contentEl.value = "";
      renderFeed();
    });

    renderFeed();
  }

  // =========================================================
  // 10. DEFAULT HEALTHCARE WORKER CHAT (messages.html)
  // =========================================================
  const chatForm = document.getElementById("chat-form");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");

  const defaultChat = [
    {
      sender: "nurse",
      time: "Today, 9:00 AM",
      text: "Hello! I'm Nurse Clarissa Reyes, RN. You don't need to send a friend request—I'm already connected here as your default maternal health contact. How can I help you today?"
    }
  ];

  if (chatForm && chatMessages) {
    const chatKey = "pw_nurse_chat";
    const getChat = () => {
      const saved = localStorage.getItem(chatKey);
      return saved ? JSON.parse(saved) : defaultChat;
    };

    const renderChat = () => {
      const msgs = getChat();
      chatMessages.innerHTML = msgs
        .map((m) =>
          m.sender === "nurse"
            ? `
            <div class="flex items-start gap-3 max-w-xl">
              <div class="h-8 w-8 shrink-0 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">CR</div>
              <div class="rounded-2xl rounded-tl-none bg-white border border-slate-200 p-3.5">
                <p class="text-sm text-slate-700 leading-relaxed">${escapeHTML(m.text)}</p>
                <span class="block mt-1 text-[10px] text-slate-400">${escapeHTML(m.time)}</span>
              </div>
            </div>
          `
            : `
            <div class="flex justify-end">
              <div class="max-w-xl rounded-2xl rounded-tr-none bg-rose-600 text-white p-3.5">
                <p class="text-sm leading-relaxed">${escapeHTML(m.text)}</p>
                <span class="block mt-1 text-[10px] text-rose-200 text-right">${escapeHTML(m.time)}</span>
              </div>
            </div>
          `
        )
        .join("");
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const getNurseReply = (msg) => {
      const q = msg.toLowerCase();
      if (q.includes("checkup") || q.includes("schedule")) {
        return "Standard prenatal visits are once a month up to week 28, every 2 weeks from weeks 28–36, and weekly from week 36 until delivery. Click 'Local Health Centers' on the sidebar to see clinic hours near you.";
      }
      if (q.includes("nausea") || q.includes("morning sickness")) {
        return "Try eating small, frequent meals (like plain crackers before getting out of bed), stay hydrated with small sips of water or ginger tea, and avoid strong odors. Let me know if you cannot keep fluids down.";
      }
      if (q.includes("health center") || q.includes("clinic") || q.includes("nearest")) {
        return "You can tap the 'Local Health Centers' button in the sidebar anytime to view addresses, services, and direct contact numbers in your area.";
      }
      return "Thank you for reaching out! I've noted your question. For personalized physical assessment, please visit your nearest Rural Health Unit or share what week of pregnancy you are currently in.";
    };

    const sendMessage = (text) => {
      const current = getChat();
      current.push({ sender: "user", time: "Just now", text });
      localStorage.setItem(chatKey, JSON.stringify(current));
      renderChat();

      setTimeout(() => {
        const afterReply = getChat();
        afterReply.push({ sender: "nurse", time: "Just now", text: getNurseReply(text) });
        localStorage.setItem(chatKey, JSON.stringify(afterReply));
        renderChat();
      }, 600);
    };

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = "";
      sendMessage(text);
    });

    document.querySelectorAll(".quick-ask").forEach((btn) => {
      btn.addEventListener("click", () => sendMessage(btn.textContent.trim()));
    });

    renderChat();
  }

  // =========================================================
  // 11. LOCAL HEALTH CENTERS DIRECTORY MODAL (All Pages)
  // =========================================================
  const openModalBtn = document.getElementById("open-health-centers-btn");
  const modal = document.getElementById("health-centers-modal");

  const healthCenters = [
    {
      name: "Mamburao Municipal Rural Health Unit (RHU)",
      address: "Poblacion, Mamburao, Occidental Mindoro",
      hours: "Mon–Fri: 8:00 AM – 5:00 PM (24/7 Birthing Home)",
      phone: "(043) 711-1024 / 0917-555-0142",
      services: "Free Prenatal Checkups, Ultrasound Referral, Iron & Folic Acid, Safe Delivery"
    },
    {
      name: "Santa Cruz Municipal Health Office",
      address: "Poblacion 1, Santa Cruz, Occidental Mindoro",
      hours: "Mon–Fri: 8:00 AM – 5:00 PM",
      phone: "0918-442-8890",
      services: "Maternal & Child Health, Youth-Friendly Teen Clinic, Immunization"
    },
    {
      name: "Barangay Barahan Health Station",
      address: "Brgy. Barahan, Santa Cruz, Occidental Mindoro",
      hours: "Mon–Fri: 8:00 AM – 4:00 PM",
      phone: "0920-319-7741",
      services: "Initial Prenatal Screening, Blood Pressure Monitoring, Midwife Consultation"
    },
    {
      name: "Occidental Mindoro Provincial Hospital (OB-GYN Dept.)",
      address: "Brgy. Payompon, Mamburao, Occidental Mindoro",
      hours: "Open 24 Hours (Emergency & Maternity Ward)",
      phone: "(043) 711-1188",
      services: "High-Risk Pregnancy Care, Emergency Obstetrics, Laboratory & Ultrasound"
    }
  ];

  if (openModalBtn && modal) {
    modal.innerHTML = `
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-rose-100 overflow-hidden">
        <div class="flex items-center justify-between bg-rose-600 px-6 py-4 text-white">
          <div>
            <h3 class="text-lg font-bold">Local Health Centers &amp; Contact Directory</h3>
            <p class="text-xs text-rose-100">Find maternal care clinics, hours, and emergency contact numbers near you</p>
          </div>
          <button id="close-health-centers-btn" type="button" class="rounded-lg p-1.5 hover:bg-rose-700 text-white">&times;</button>
        </div>
        <div class="p-5 border-b border-slate-100">
          <input type="text" id="center-search" placeholder="Search by municipality, barangay, or service..." class="w-full rounded-xl border-slate-200 text-sm focus:border-rose-500 focus:ring-rose-500" />
        </div>
        <div id="health-centers-list" class="custom-scroll max-h-96 overflow-y-auto p-5 space-y-4"></div>
      </div>
    `;

    const listEl = document.getElementById("health-centers-list");
    const searchEl = document.getElementById("center-search");
    const closeBtn = document.getElementById("close-health-centers-btn");

    const renderCenters = (filter = "") => {
      const q = filter.toLowerCase();
      const filtered = healthCenters.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.services.toLowerCase().includes(q)
      );

      listEl.innerHTML = filtered.length
        ? filtered
            .map(
              (c) => `
            <div class="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
              <h4 class="font-bold text-slate-900">${escapeHTML(c.name)}</h4>
              <p class="text-xs text-slate-600 mt-1">📍 ${escapeHTML(c.address)}</p>
              <p class="text-xs text-slate-600 mt-0.5">🕒 ${escapeHTML(c.hours)}</p>
              <p class="text-xs text-rose-700 font-medium mt-1">🩺 ${escapeHTML(c.services)}</p>
              <div class="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-100">
                <span class="text-sm font-bold text-slate-800">📞 ${escapeHTML(c.phone)}</span>
                <button type="button" onclick="navigator.clipboard.writeText('${escapeHTML(c.phone)}'); this.textContent='Copied!';" class="rounded-lg bg-white border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Copy Number</button>
              </div>
            </div>
          `
            )
            .join("")
        : `<p class="text-center text-sm text-slate-500 py-6">No matching health centers found.</p>`;
    };

    openModalBtn.addEventListener("click", () => {
      renderCenters();
      modal.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
    searchEl.addEventListener("input", (e) => renderCenters(e.target.value));
  }
});

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}