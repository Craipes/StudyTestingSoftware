
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import api from '@/lib/axios';
import { Label } from '../ui/label';

interface UserSuggestion {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
}

interface AutoSuggestInputProps {
  name: string;
  placeholder: string;
  label: string;
}

export const AutoSuggestInput: React.FC<AutoSuggestInputProps> = ({ name, placeholder, label }) => {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { register, watch, setValue } = useFormContext();
  const inputValue = watch(name);

  const fetchSuggestions = async (prefix: string) => {
    if (prefix.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await api.get(`/user/find-users?emailPrefix=${prefix}`);
      setSuggestions(response.data);
    } catch (err) {
      console.error('Failed to fetch user suggestions:', err);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (inputValue) {
        fetchSuggestions(inputValue);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue]);

  const handleSuggestionClick = (suggestion: UserSuggestion) => {
    setValue(name, suggestion.email, { shouldValidate: true });
    setSuggestions([]);
    setIsInputFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsInputFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <Input
        autoComplete='off'
        id={name}
        type="text"
        placeholder={placeholder}
        className="w-full"
        {...register(name)}
        onFocus={() => setIsInputFocused(true)}
      />
      {isInputFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((user) => (
            <li
              key={user.email}
              onClick={() => handleSuggestionClick(user)}
              className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="font-semibold">{user.email}</span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                {user.lastName} {user.firstName}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};