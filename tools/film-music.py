"""Cicha, ciepła muzyka tła do filmu, syntetyzowana od zera (bez cudzych nagrań).
Użycie: python tools/film-music.py <sekundy> <plik.wav>"""
import sys, wave
import numpy as np

SR = 44100
seconds = float(sys.argv[1]); out = sys.argv[2]
n = int(SR * seconds)
t = np.arange(n) / SR

def note(midi): return 440.0 * 2 ** ((midi - 69) / 12)

# Spokojna progresja: Cmaj9 - Am9 - Fmaj9 - G6, po 4 s każdy akord.
chords = [[48, 55, 64, 71, 74], [45, 52, 60, 67, 71], [41, 48, 57, 64, 67], [43, 50, 59, 64, 69]]
bar = 4.0
left = np.zeros(n); right = np.zeros(n)
for i in range(int(np.ceil(seconds / bar)) + 1):
    start = i * bar - 0.6
    chord = chords[i % len(chords)]
    a = max(0, int(start * SR)); b = min(n, int((start + bar + 1.6) * SR))
    if a >= b: continue
    tt = t[a:b] - start
    env = np.clip(tt / 1.2, 0, 1) * np.clip((bar + 1.6 - tt) / 1.4, 0, 1)
    for k, m in enumerate(chord):
        f = note(m)
        for detune, pan in ((-0.0025, 0.3), (0.0025, 0.7)):
            ph = 2 * np.pi * f * (1 + detune) * tt
            tone = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
            amp = (0.8 if k < 2 else 0.5) * env
            left[a:b] += tone * amp * (1 - pan); right[a:b] += tone * amp * pan

# Delikatne „dzwoneczki” (arpeggio) co pół taktu.
for i in range(int(seconds / (bar / 2))):
    start = i * bar / 2 + 0.25
    chord = chords[int(start // bar) % len(chords)]
    m = chord[2 + (i % 3)] + 12
    a = int(start * SR); b = min(n, a + int(1.8 * SR))
    if a >= n: break
    tt = t[a:b] - start
    tone = np.sin(2 * np.pi * note(m) * tt) * np.exp(-tt * 2.6) * 0.35
    left[a:b] += tone * 0.6; right[a:b] += tone * 0.4

# Miękki filtr dolnoprzepustowy (średnia krocząca) i wyciszenie na początku i końcu.
kernel = np.ones(9) / 9
left = np.convolve(left, kernel, 'same'); right = np.convolve(right, kernel, 'same')
fade = np.minimum(1, np.minimum(t / 2.5, (seconds - t) / 3.0)).clip(0, 1)
stereo = np.stack([left * fade, right * fade], axis=1)
stereo /= np.max(np.abs(stereo)) + 1e-9
stereo *= 0.6
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
print('music', out, seconds)
