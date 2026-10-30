import React, { useState, useEffect } from 'react';

export default function CharacterApp() {
  const [characters, setCharacters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ดึงข้อมูลจริงจาก Backend (Express) ที่พอร์ต 3000
  useEffect(() => {
    fetch('http://localhost:3000/characters')
      .then(res => res.json())
      .then(data => {
        const characterList = Array.isArray(data) ? data : (data.data || []);
        setCharacters(characterList);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching characters:", err);
        setLoading(false);
      });
  }, []);

  // 5. Scroll to Top: ตรวจจับการเลื่อนหน้าจอ เพื่อแสดงปุ่มกลับด้านบนที่ "กึ่งกลางด้านล่าง"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // กรองรายชื่อตัวละครตามคำค้นหา
  const filteredCharacters = characters.filter(char =>
    char.name && char.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f9f9f9', minHeight: '100vh', paddingBottom: '80px' }}>
      <h2>🐴 My Little Pony Character Explorer</h2>

      {/* 2. Clear Search: ช่องค้นหา + ปุ่มล้างคำค้นหาเมื่อเริ่มพิมพ์ */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="พิมพ์ชื่อตัวละคร (เช่น Twilight, Pinkie)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, minHeight: '44px', padding: '0 12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '6px' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ minHeight: '44px', padding: '0 16px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ล้างคำค้นหา
          </button>
        )}
      </div>

      {/* สถานะกำลังโหลด */}
      {loading && <p style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลดข้อมูลตัวละครจากเซิร์ฟเวอร์...</p>}

      {/* 3. Empty State: กรณีค้นหาไม่พบ จะแสดงข้อความและปุ่มล้างคำค้นหาอำนวยความสะดวก */}
      {!loading && filteredCharacters.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 10px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <p>❌ ไม่พบตัวละครที่คุณค้นหา</p>
          <button
            onClick={() => setSearchQuery('')}
            style={{ minHeight: '44px', padding: '0 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
          >
            ล้างการค้นหา
          </button>
        </div>
      )}

      {/* 4. Touch Target: ขนาดการ์ดและพื้นที่คลิกถูกออกแบบให้ใหญ่พอดี กดง่ายบนจอมือถือ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {!loading && filteredCharacters.map(char => (
          <div
            key={char.id}
            onClick={() => setSelectedCharacter(char)} // 1. Modal: คลิกการ์ดเพื่อเปิดดูรายชื่อตอนทันทีโดยไม่ต้องเปลี่ยนหน้า
            style={{
              background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0',
              cursor: 'pointer', minHeight: '80px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <strong style={{ fontSize: '16px' }}>{char.name}</strong><br />
            <small style={{ color: '#666' }}>ปรากฏตัว: {char.episodeCount || 0} ตอน</small>
          </div>
        ))}
      </div>

      {/* 1. Modal Popup แสดงรายละเอียดตอนที่ปรากฏ */}
      {selectedCharacter && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '450px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>{selectedCharacter.name}</h3>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
              <strong>อาชีพ:</strong> {selectedCharacter.occupation || 'ไม่ระบุ'}
            </p>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
              <strong>สถานที่อยู่:</strong> {selectedCharacter.residence || 'ไม่ระบุ'}
            </p>
            
            <h4 style={{ marginTop: '15px' }}>ตอนที่ปรากฏตัว ({selectedCharacter.episodeCount || 0} ตอน):</h4>
            <ul style={{ paddingLeft: '20px', maxHeight: '200px', overflowY: 'auto' }}>
              {selectedCharacter.appearanceEpisodes && selectedCharacter.appearanceEpisodes.length > 0 ? (
                selectedCharacter.appearanceEpisodes.map((ep, index) => (
                  <li key={index} style={{ marginBottom: '6px', fontSize: '14px' }}>
                    <strong>{ep.code}</strong>: {ep.name}
                  </li>
                ))
              ) : (
                <li>ไม่พบข้อมูลตอนที่ปรากฏ</li>
              )}
            </ul>

            <button
              onClick={() => setSelectedCharacter(null)}
              style={{ width: '100%', minHeight: '44px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' }}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* 5. Scroll to Top: ปุ่มลูกศรกลับขึ้นด้านบน (ลอยอยู่ที่ "มุมตรงกลางล่าง") */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            width: '45px', height: '45px', borderRadius: '50%', background: '#1976d2', color: '#fff',
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99
          }}
          title="กลับสู่ด้านบน"
        >
          ↑
        </button>
      )}
    </div>
  );
}