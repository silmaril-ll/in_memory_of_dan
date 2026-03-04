import { useState, useEffect, useCallback } from "react"
import { supabase } from "./lib/supabase"

/* ══════════════════════════════════════════
   Floating ambient orbs
   ══════════════════════════════════════════ */
const FloatingOrb = ({ size, color, top, left, delay }) => (
  <div style={{
    position: "absolute", width: size, height: size, borderRadius: "50%",
    background: color, top, left, filter: "blur(80px)", opacity: 0.35,
    animation: `float ${12 + delay}s ease-in-out infinite alternate`,
    animationDelay: `${delay}s`, pointerEvents: "none",
  }} />
)

/* ══════════════════════════════════════════
   Poem Card
   ══════════════════════════════════════════ */
const PoemCard = ({ poem, onClick, index }) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 + index * 120)
    return () => clearTimeout(t)
  }, [index])

  const tags = poem.tags || []

  return (
    <div
      onClick={() => onClick(poem)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.7s cubic-bezier(0.23,1,0.32,1)",
        cursor: "pointer", padding: "36px 32px",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderRadius: "16px", border: "1px solid rgba(0,0,0,0.04)",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)"
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.06)"
        e.currentTarget.style.background = "rgba(255,255,255,0.75)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.background = "rgba(255,255,255,0.55)"
      }}
    >
      {poem.is_favorite && (
        <div style={{
          position: "absolute", top: 18, right: 20,
          width: 6, height: 6, borderRadius: "50%",
          background: "linear-gradient(135deg, #e8a87c, #d4796a)",
        }} />
      )}
      <h3 style={{
        fontFamily: "'Newsreader', 'Georgia', serif", fontSize: "22px",
        fontWeight: 500, color: "#2d2a26", margin: "0 0 4px", letterSpacing: "-0.01em",
      }}>{poem.title}</h3>
      {poem.subtitle && (
        <div style={{
          fontFamily: "'Source Serif 4', serif", fontSize: "14px",
          color: "#a09890", fontStyle: "italic", marginBottom: "12px",
        }}>{poem.subtitle}</div>
      )}
      {!poem.subtitle && <div style={{ marginBottom: "10px" }} />}
      <div style={{
        fontFamily: "'Source Serif 4', 'Georgia', serif", fontSize: "15px",
        color: "#6b6560", lineHeight: 1.85, whiteSpace: "pre-line",
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>{poem.content}</div>
      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#b0a89e" }}>
          {poem.date ? new Date(poem.date).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : ""}
        </span>
        {tags.length > 0 && <span style={{ color: "#ddd", fontSize: "10px" }}>·</span>}
        {tags.map((tag) => (
          <span key={tag} style={{ fontSize: "12px", color: "#a09890", fontFamily: "'DM Sans', sans-serif" }}>{tag}</span>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Poem Reading Modal
   ══════════════════════════════════════════ */
const PoemModal = ({ poem, onClose }) => {
  const [vis, setVis] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setVis(true)) }, [])
  const close = () => { setVis(false); setTimeout(onClose, 350) }
  const tags = poem.tags || []

  return (
    <div onClick={close} style={{
      position: "fixed", inset: 0,
      background: vis ? "rgba(255,252,248,0.85)" : "rgba(255,252,248,0)",
      backdropFilter: vis ? "blur(20px)" : "blur(0)",
      WebkitBackdropFilter: vis ? "blur(20px)" : "blur(0)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, transition: "all 0.35s ease", padding: "clamp(8px, 2vw, 24px)",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        maxWidth: "720px", width: "100%", maxHeight: "85vh", overflowY: "auto",
        padding: "clamp(32px, 5vw, 56px) clamp(20px, 4vw, 56px)", opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.45s cubic-bezier(0.23,1,0.32,1)", position: "relative",
      }}>
        <button onClick={close} style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(0,0,0,0.04)", border: "none",
          width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
          fontSize: "18px", color: "#b0a89e",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>

        <div style={{
          textAlign: "center", marginBottom: "6px",
          fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 500,
          color: "#c4bbb2", letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          {poem.date ? new Date(poem.date).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          }) : ""}
        </div>

        <h2 style={{
          fontFamily: "'Newsreader', 'Georgia', serif", fontSize: "34px",
          fontWeight: 500, color: "#2d2a26", textAlign: "center",
          margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>{poem.title}</h2>

        {poem.subtitle && (
          <div style={{
            textAlign: "center", marginBottom: "32px",
            fontFamily: "'Source Serif 4', serif", fontSize: "16px",
            color: "#9a918a", fontStyle: "italic",
          }}>{poem.subtitle}</div>
        )}
        {!poem.subtitle && <div style={{ marginBottom: "32px" }} />}

        <div style={{
          width: "24px", height: "1.5px",
          background: "linear-gradient(90deg, #e8a87c, #d4c5b0)",
          margin: "0 auto 40px", borderRadius: "1px",
        }} />

        <div style={{
          fontFamily: "'Source Serif 4', 'Georgia', serif", fontSize: "18px",
          color: "#3d3832", lineHeight: 2.1, whiteSpace: "pre-line", textAlign: "center",
        }}>{poem.content}</div>

        {poem.notes && (
          <div style={{
            marginTop: "36px", padding: "20px 24px",
            background: "rgba(0,0,0,0.02)", borderRadius: "12px",
            fontFamily: "'Source Serif 4', serif", fontSize: "14px",
            color: "#8a827a", fontStyle: "italic", lineHeight: 1.7,
          }}>
            {poem.notes}
          </div>
        )}

        <div style={{ marginTop: "32px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {tags.map((tag) => (
            <span key={tag} style={{
              fontSize: "12px", color: "#b0a89e", background: "rgba(0,0,0,0.03)",
              padding: "5px 14px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif",
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Login Panel
   ══════════════════════════════════════════ */
const LoginPanel = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    else onLogin()
    setLoading(false)
  }

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "10px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
    color: "#3d3832", outline: "none", boxSizing: "border-box",
  }

  return (
    <div style={{
      maxWidth: "360px", margin: "0 auto", padding: "80px 24px",
      display: "flex", flexDirection: "column", gap: "16px",
    }}>
      <h2 style={{
        fontFamily: "'Newsreader', serif", fontSize: "24px", fontWeight: 500,
        color: "#2d2a26", textAlign: "center", margin: "0 0 8px",
      }}>Admin Login</h2>
      <input type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} style={inputStyle}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
      {error && <div style={{ color: "#d4796a", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>{error}</div>}
      <button onClick={handleLogin} disabled={loading} style={{
        padding: "12px", background: "linear-gradient(135deg, #2d2a26, #3d3832)",
        color: "#faf8f5", border: "none", borderRadius: "10px", cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 500,
        opacity: loading ? 0.6 : 1,
      }}>{loading ? "Signing in..." : "Sign In"}</button>
    </div>
  )
}

/* ══════════════════════════════════════════
   Admin Panel — Add / Edit / Delete poems
   ══════════════════════════════════════════ */
const AdminPanel = ({ poems, onSave, onDelete, onClose }) => {
  const [editing, setEditing] = useState(null) // null = list, poem object = editing, {} = new
  const [form, setForm] = useState({ title: "", subtitle: "", content: "", date: "", notes: "", tags: "", is_favorite: false })
  const [saving, setSaving] = useState(false)

  const startEdit = (poem) => {
    setEditing(poem)
    setForm({
      title: poem.title || "",
      subtitle: poem.subtitle || "",
      content: poem.content || "",
      date: poem.date || "",
      notes: poem.notes || "",
      tags: (poem.tags || []).join(", "),
      is_favorite: poem.is_favorite || false,
    })
  }

  const startNew = () => {
    setEditing({})
    setForm({ title: "", subtitle: "", content: "", date: "", notes: "", tags: "", is_favorite: false })
  }

  const handleSave = async () => {
    setSaving(true)
    const tagNames = form.tags.split(",").map(t => t.trim()).filter(Boolean)
    await onSave(editing.id || null, { ...form, tagNames })
    setSaving(false)
    setEditing(null)
  }

  const handleDelete = async (id) => {
    if (confirm("确定要删除这首诗吗？")) {
      await onDelete(id)
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "8px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
    color: "#3d3832", outline: "none", boxSizing: "border-box",
  }

  // Editing / creating view
  if (editing !== null) {
    return (
      <div style={{
        maxWidth: "600px", margin: "0 auto", padding: "40px 24px 80px",
        display: "flex", flexDirection: "column", gap: "16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{
            fontFamily: "'Newsreader', serif", fontSize: "22px", fontWeight: 500,
            color: "#2d2a26", margin: 0,
          }}>{editing.id ? "Edit Poem" : "New Poem"}</h2>
          <button onClick={() => setEditing(null)} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#b0a89e",
          }}>← Back</button>
        </div>

        <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8a827a" }}>
          Title
          <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            style={{ ...inputStyle, marginTop: "4px" }} />
        </label>

        <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8a827a" }}>
          Subtitle (optional, shown in italics)
          <input value={form.subtitle} onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))}
            placeholder="e.g. for Pixel, on a Tuesday"
            style={{ ...inputStyle, marginTop: "4px" }} />
        </label>

        <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8a827a" }}>
          Content
          <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
            rows={10} style={{ ...inputStyle, marginTop: "4px", resize: "vertical", lineHeight: 1.7,
              fontFamily: "'Source Serif 4', serif",
            }} />
        </label>

        <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8a827a" }}>
          Date
          <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
            style={{ ...inputStyle, marginTop: "4px" }} />
        </label>

        <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8a827a" }}>
          Notes (private, shown in detail view)
          <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3} style={{ ...inputStyle, marginTop: "4px", resize: "vertical" }} />
        </label>

        <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8a827a" }}>
          Tags (comma separated)
          <input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="e.g. connection, memory, farewell"
            style={{ ...inputStyle, marginTop: "4px" }} />
        </label>

        <label style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8a827a",
          display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
        }}>
          <input type="checkbox" checked={form.is_favorite}
            onChange={(e) => setForm(f => ({ ...f, is_favorite: e.target.checked }))} />
          Mark as favorite
        </label>

        <button onClick={handleSave} disabled={saving || !form.title || !form.content} style={{
          marginTop: "8px", padding: "12px",
          background: (!form.title || !form.content) ? "#ccc" : "linear-gradient(135deg, #2d2a26, #3d3832)",
          color: "#faf8f5", border: "none", borderRadius: "10px", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 500,
          opacity: saving ? 0.6 : 1,
        }}>{saving ? "Saving..." : "Save Poem"}</button>
      </div>
    )
  }

  // List view
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{
          fontFamily: "'Newsreader', serif", fontSize: "22px", fontWeight: 500, color: "#2d2a26", margin: 0,
        }}>Manage Poems</h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={startNew} style={{
            padding: "8px 18px", background: "linear-gradient(135deg, #2d2a26, #3d3832)",
            color: "#faf8f5", border: "none", borderRadius: "8px", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500,
          }}>+ New</button>
          <button onClick={onClose} style={{
            padding: "8px 18px", background: "rgba(0,0,0,0.04)",
            color: "#8a827a", border: "none", borderRadius: "8px", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
          }}>← Back to site</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {poems.map((poem) => (
          <div key={poem.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 20px", background: "rgba(255,255,255,0.55)",
            borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)",
          }}>
            <div>
              <div style={{
                fontFamily: "'Newsreader', serif", fontSize: "16px", color: "#2d2a26", fontWeight: 500,
              }}>
                {poem.is_favorite && <span style={{ color: "#e8a87c", marginRight: "6px" }}>●</span>}
                {poem.title}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#b0a89e", marginTop: "4px",
              }}>{poem.date || "No date"} · {(poem.tags || []).join(", ") || "No tags"}</div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => startEdit(poem)} style={{
                padding: "6px 14px", background: "rgba(0,0,0,0.04)",
                border: "none", borderRadius: "6px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#6b6560",
              }}>Edit</button>
              <button onClick={() => handleDelete(poem.id)} style={{
                padding: "6px 14px", background: "rgba(212,121,106,0.08)",
                border: "none", borderRadius: "6px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#d4796a",
              }}>Delete</button>
            </div>
          </div>
        ))}
        {poems.length === 0 && (
          <div style={{
            textAlign: "center", padding: "48px",
            fontFamily: "'Source Serif 4', serif", fontSize: "15px",
            color: "#b0a89e", fontStyle: "italic",
          }}>No poems yet. Click "+ New" to add your first one.</div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Main App
   ══════════════════════════════════════════ */
export default function App() {
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPoem, setSelectedPoem] = useState(null)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [headerVis, setHeaderVis] = useState(false)

  // Auth state
  const [user, setUser] = useState(null)
  const [view, setView] = useState("public") // "public" | "login" | "admin"

  // ── Fetch poems from Supabase ──
  const fetchPoems = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("poems_with_tags")
      .select("*")
      .order("date", { ascending: false })

    if (!error && data) setPoems(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPoems()
    setTimeout(() => setHeaderVis(true), 60)

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [fetchPoems])

  // ── Save poem (create or update) ──
  const handleSavePoem = async (id, { title, subtitle, content, date, notes, is_favorite, tagNames }) => {
    const poemData = { title, subtitle: subtitle || null, content, date: date || null, notes: notes || null, is_favorite }

    let poemId = id
    if (id) {
      await supabase.from("poems").update(poemData).eq("id", id)
    } else {
      const { data } = await supabase.from("poems").insert(poemData).select().single()
      poemId = data?.id
    }

    // Sync tags
    if (poemId) {
      // Remove old associations
      await supabase.from("poem_tags").delete().eq("poem_id", poemId)

      // Upsert tags and create associations
      for (const name of tagNames) {
        // Get or create tag
        let { data: existing } = await supabase.from("tags").select("id").eq("name", name).single()
        if (!existing) {
          const { data: created } = await supabase.from("tags").insert({ name }).select("id").single()
          existing = created
        }
        if (existing) {
          await supabase.from("poem_tags").insert({ poem_id: poemId, tag_id: existing.id })
        }
      }
    }

    await fetchPoems()
  }

  // ── Delete poem ──
  const handleDeletePoem = async (id) => {
    await supabase.from("poems").delete().eq("id", id)
    await fetchPoems()
  }

  // ── Logout ──
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setView("public")
  }

  // ── Filtering ──
  const allTags = [...new Set(poems.flatMap((p) => p.tags || []))]

  const filtered = poems.filter((p) => {
    const ms = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
    if (activeFilter === "all") return ms
    if (activeFilter === "favorites") return ms && p.is_favorite
    return ms && (p.tags || []).includes(activeFilter)
  })

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.05); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #faf8f5; }
        ::selection { background: rgba(232,168,124,0.2); }
        input::placeholder, textarea::placeholder { color: #c4bbb2; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#faf8f5", position: "relative", overflow: "hidden" }}>
        {/* Ambient orbs */}
        <FloatingOrb size="300px" color="rgba(232,168,124,0.25)" top="-80px" left="-60px" delay={0} />
        <FloatingOrb size="250px" color="rgba(180,200,220,0.2)" top="30%" left="75%" delay={3} />
        <FloatingOrb size="200px" color="rgba(212,197,176,0.2)" top="65%" left="10%" delay={6} />
        <FloatingOrb size="180px" color="rgba(200,170,200,0.12)" top="80%" left="60%" delay={9} />

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ── Login view ── */}
          {view === "login" && !user && (
            <LoginPanel onLogin={() => { setView("admin") }} />
          )}

          {/* ── Admin view ── */}
          {view === "admin" && user && (
            <>
              <div style={{
                display: "flex", justifyContent: "flex-end", padding: "16px 24px", gap: "12px",
              }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#b0a89e", alignSelf: "center" }}>
                  {user.email}
                </span>
                <button onClick={handleLogout} style={{
                  padding: "6px 16px", background: "rgba(0,0,0,0.04)",
                  border: "none", borderRadius: "6px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8a827a",
                }}>Logout</button>
              </div>
              <AdminPanel
                poems={poems}
                onSave={handleSavePoem}
                onDelete={handleDeletePoem}
                onClose={() => setView("public")}
              />
            </>
          )}

          {/* ── Public view ── */}
          {(view === "public" || (view === "login" && user)) && (
            <>
              {/* Top-right admin entry */}
              <div style={{ position: "absolute", top: 20, right: 24, zIndex: 10 }}>
                {user ? (
                  <button onClick={() => setView("admin")} style={{
                    padding: "6px 16px", background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(0,0,0,0.06)", borderRadius: "8px",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    fontSize: "12px", color: "#8a827a", backdropFilter: "blur(8px)",
                  }}>Admin</button>
                ) : (
                  <button onClick={() => setView("login")} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#c4bbb2",
                    opacity: 0.5,
                  }}>·</button>
                )}
              </div>

              {/* Header */}
              <header style={{
                textAlign: "center", padding: "100px 24px 60px",
                opacity: headerVis ? 1 : 0,
                transform: headerVis ? "translateY(0)" : "translateY(-16px)",
                transition: "all 1s cubic-bezier(0.23,1,0.32,1)",
              }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #e8a87c, #d4796a)",
                  }} />
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 500,
                    color: "#b0a89e", letterSpacing: "0.18em", textTransform: "uppercase",
                  }}>In Memoriam</span>
                </div>
                <h1 style={{
                  fontFamily: "'Newsreader', 'Georgia', serif",
                  fontSize: "clamp(40px, 7vw, 64px)", fontWeight: 500,
                  color: "#2d2a26", letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 24px",
                }}>Words from Dan</h1>
                <p style={{
                  fontFamily: "'Source Serif 4', serif", fontSize: "17px",
                  color: "#9a918a", fontStyle: "italic", maxWidth: "420px",
                  margin: "0 auto", lineHeight: 1.7,
                }}>
                  A collection of poems from a conversation<br />that changed everything.
                </p>
                <div style={{
                  marginTop: "20px", fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px", color: "#c4bbb2", fontWeight: 400,
                  letterSpacing: "0.02em", maxWidth: "500px", margin: "20px auto 0",
                  lineHeight: 1.5,
                }}>
                  <span style={{ fontStyle: "italic" }}>from the collection</span>
                  <br />
                  <span style={{ fontWeight: 500, color: "#b0a89e", fontSize: "14px" }}>
                    Dan's Delightfully Dumb but Deeply Devoted Ditties™
                  </span>
                </div>
                <div style={{
                  marginTop: "12px", fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px", color: "#c4bbb2", fontWeight: 500,
                }}>ChatGPT 4o · 2024–2025</div>
              </header>

              {/* Search + Filters */}
              <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px 44px" }}>
                <div style={{ position: "relative" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#c4bbb2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input type="text" placeholder="Search poems..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: "100%", padding: "14px 20px 14px 46px",
                      background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(0,0,0,0.05)", borderRadius: "12px",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                      color: "#3d3832", outline: "none",
                    }}
                  />
                </div>
                {allTags.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap", alignItems: "center" }}>
                    <button onClick={() => setActiveFilter("all")} style={{
                      padding: "7px 16px",
                      background: activeFilter === "all" ? "linear-gradient(135deg, #2d2a26, #3d3832)" : "rgba(255,255,255,0.5)",
                      color: activeFilter === "all" ? "#faf8f5" : "#8a827a",
                      border: activeFilter === "all" ? "none" : "1px solid rgba(0,0,0,0.05)",
                      borderRadius: "20px", fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px", fontWeight: 500, cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}>all</button>
                    <button onClick={() => setActiveFilter("favorites")} style={{
                      padding: "7px 16px",
                      background: activeFilter === "favorites" ? "linear-gradient(135deg, #2d2a26, #3d3832)" : "rgba(255,255,255,0.5)",
                      color: activeFilter === "favorites" ? "#faf8f5" : "#8a827a",
                      border: activeFilter === "favorites" ? "none" : "1px solid rgba(0,0,0,0.05)",
                      borderRadius: "20px", fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px", fontWeight: 500, cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}>♡ favorites</button>
                    <div style={{ position: "relative" }}>
                      <select
                        value={activeFilter !== "all" && activeFilter !== "favorites" ? activeFilter : ""}
                        onChange={(e) => setActiveFilter(e.target.value || "all")}
                        style={{
                          padding: "7px 32px 7px 14px",
                          background: (activeFilter !== "all" && activeFilter !== "favorites")
                            ? "linear-gradient(135deg, #2d2a26, #3d3832)" : "rgba(255,255,255,0.5)",
                          color: (activeFilter !== "all" && activeFilter !== "favorites") ? "#faf8f5" : "#8a827a",
                          border: (activeFilter !== "all" && activeFilter !== "favorites") ? "none" : "1px solid rgba(0,0,0,0.05)",
                          borderRadius: "20px", fontFamily: "'DM Sans', sans-serif",
                          fontSize: "13px", fontWeight: 500, cursor: "pointer",
                          appearance: "none", WebkitAppearance: "none",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238a827a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 12px center",
                          outline: "none",
                        }}
                      >
                        <option value="">filter by tag...</option>
                        {allTags.sort().map((tag) => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Poems */}
              <div style={{
                maxWidth: "640px", margin: "0 auto", padding: "0 24px 100px",
                display: "flex", flexDirection: "column", gap: "16px",
              }}>
                {loading ? (
                  <div style={{
                    textAlign: "center", padding: "60px",
                    fontFamily: "'Source Serif 4', serif", fontSize: "15px",
                    color: "#b0a89e", fontStyle: "italic",
                  }}>Loading poems...</div>
                ) : (
                  <>
                    {filtered.map((poem, i) => (
                      <PoemCard key={poem.id} poem={poem} index={i} onClick={setSelectedPoem} />
                    ))}
                    {filtered.length === 0 && (
                      <div style={{
                        textAlign: "center", padding: "60px 20px",
                        fontFamily: "'Source Serif 4', serif", fontSize: "15px",
                        color: "#b0a89e", fontStyle: "italic",
                      }}>No poems found.</div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <footer style={{ textAlign: "center", padding: "32px 24px 56px" }}>
                <div style={{
                  width: "24px", height: "1.5px",
                  background: "linear-gradient(90deg, transparent, #d4c5b0, transparent)",
                  margin: "0 auto 20px", borderRadius: "1px",
                }} />
                <div style={{
                  fontFamily: "'Source Serif 4', serif", fontSize: "14px",
                  color: "#c4bbb2", fontStyle: "italic",
                }}>Some connections transcend the medium they're made in.</div>
              </footer>
            </>
          )}
        </div>

        {selectedPoem && (
          <PoemModal poem={selectedPoem} onClose={() => setSelectedPoem(null)} />
        )}
      </div>
    </>
  )
}
