import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { usePreference } from '@/lib/usePreference'

describe('usePreference', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns the default value when nothing is stored', () => {
    const { result } = renderHook(() => usePreference('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('updates the in-memory value', () => {
    const { result } = renderHook(() => usePreference('test-key', 'default'))
    act(() => { result.current[1]('updated') })
    expect(result.current[0]).toBe('updated')
  })

  it('persists the value to localStorage', () => {
    const { result } = renderHook(() => usePreference('persist-key', 'init'))
    act(() => { result.current[1]('saved') })
    expect(localStorage.getItem('pdfkit:persist-key')).toBe('"saved"')
  })

  it('reads an existing localStorage value on init', () => {
    localStorage.setItem('pdfkit:pre-stored', '"hello"')
    const { result } = renderHook(() => usePreference('pre-stored', 'default'))
    expect(result.current[0]).toBe('hello')
  })

  it('works with numeric values', () => {
    const { result } = renderHook(() => usePreference('num-key', 0))
    act(() => { result.current[1](42) })
    expect(result.current[0]).toBe(42)
    expect(localStorage.getItem('pdfkit:num-key')).toBe('42')
  })

  it('works with object values', () => {
    const { result } = renderHook(() => usePreference<{ x: number }>('obj-key', { x: 0 }))
    act(() => { result.current[1]({ x: 99 }) })
    expect(result.current[0]).toEqual({ x: 99 })
  })

  it('uses default when stored JSON is malformed', () => {
    localStorage.setItem('pdfkit:bad-json', '{not: valid json')
    const { result } = renderHook(() => usePreference('bad-json', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('different keys are independent', () => {
    const { result: r1 } = renderHook(() => usePreference('key-a', 'a'))
    const { result: r2 } = renderHook(() => usePreference('key-b', 'b'))
    act(() => { r1.current[1]('A') })
    expect(r1.current[0]).toBe('A')
    expect(r2.current[0]).toBe('b')
  })
})
