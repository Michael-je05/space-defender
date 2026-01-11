"""
SPACE DEFENDER - Jeu de shoot 'em up spatial
Développé avec PyGame - Projet Scolaire
"""

import sys
import os
import random
import math
from typing import List, Tuple, Optional, Dict
from dataclasses import dataclass
from enum import Enum

# ============================================
# CLASSES MOCK POUR SIMULATION SANS PYGAME
# ============================================

class MockSurface:
    def __init__(self, size):
        self.size = size
        self.width, self.height = size
    
    def fill(self, color):
        pass
    
    def blit(self, source, pos):
        pass
    
    def get_rect(self):
        return MockRect()
    
    def convert_alpha(self):
        return self

class MockRect:
    def __init__(self, x=0, y=0, w=0, h=0):
        self.x = x
        self.y = y
        self.w = w
        self.h = h
        self.centerx = x + w // 2
        self.centery = y + h // 2
        self.left = x
        self.right = x + w
        self.top = y
        self.bottom = y + h
        self.width = w
        self.height = h
    
    def colliderect(self, other):
        # Simulation simple de collision
        if other is None:
            return False
        return (abs(self.centerx - other.centerx) < (self.w + other.w) / 2 and
                abs(self.centery - other.centery) < (self.h + other.h) / 2)

class MockClock:
    def tick(self, fps):
        return 16.67  # 60 FPS en ms
    def get_fps(self):
        return 60.0

# ============================================
# VÉRIFICATION ET IMPORT PYGAME
# ============================================

PYGAME_AVAILABLE = True
try:
    import pygame
    # Vérifier que pygame est bien installé
    pygame.version.ver
except (ImportError, AttributeError):
    PYGAME_AVAILABLE = False
    print("=" * 60)
    print("⚠️  PYGAME NON INSTALLÉ - MODE SIMULATION ACTIVÉ")
    print("=" * 60)
    print("Le jeu fonctionnera en mode console sans graphiques.")
    print("Pour avoir les graphiques, installez PyGame :")
    print("    pip install pygame")
    print("=" * 60)
    
    # Créer un module pygame factice
    class MockPygame:
        class Surface:
            def __init__(self, size, flags=0):
                self._size = size
            def fill(self, color):
                pass
            def get_rect(self):
                return MockRect()
            def blit(self, source, pos):
                pass
            def convert_alpha(self):
                return self
        
        class Rect:
            def __init__(self, x, y, w, h):
                self.x = x
                self.y = y
                self.w = w
                self.h = h
                self.centerx = x + w // 2
                self.centery = y + h // 2
                self.left = x
                self.right = x + w
                self.top = y
                self.bottom = y + h
            
            def colliderect(self, other):
                if other is None:
                    return False
                return (abs(self.centerx - other.centerx) < (self.w + other.w) / 2 and
                        abs(self.centery - other.centery) < (self.h + other.h) / 2)
        
        class time:
            _ticks = 0
            @staticmethod
            def Clock():
                return MockClock()
            @staticmethod
            def get_ticks():
                MockPygame.time._ticks += 16
                return MockPygame.time._ticks
        
        class display:
            @staticmethod
            def set_mode(size):
                return MockSurface(size)
            @staticmethod
            def set_caption(title):
                print(f"Fenêtre: {title}")
            @staticmethod
            def flip():
                pass
        
        class event:
            @staticmethod
            def get():
                return []
        
        class key:
            K_UP = 273
            K_DOWN = 274
            K_LEFT = 276
            K_RIGHT = 275
            K_z = 122
            K_s = 115
            K_q = 113
            K_d = 100
            K_SPACE = 32
            K_ESCAPE = 27
            K_p = 112
            K_r = 114
        
        QUIT = "quit"
        KEYDOWN = "keydown"
        
        @staticmethod
        def init():
            print("PyGame initialisé (mode simulation)")
            return (True, True)  # (audio, video)
        
        @staticmethod
        def quit():
            print("PyGame fermé")
    
    # Remplacer pygame par notre mock
    pygame = MockPygame()

# ============================================
# CONSTANTES DE CONFIGURATION
# ============================================

class Config:
    """Configuration globale du jeu"""
    # Affichage
    SCREEN_WIDTH = 800
    SCREEN_HEIGHT = 600
    FPS = 60
    TITLE = "Space Defender"
    VERSION = "1.0.0"
    
    # Couleurs (RGB)
    BLACK = (0, 0, 0)
    WHITE = (255, 255, 255)
    RED = (255, 0, 0)
    GREEN = (0, 255, 0)
    BLUE = (0, 0, 255)
    YELLOW = (255, 255, 0)
    PURPLE = (128, 0, 128)
    CYAN = (0, 255, 255)
    ORANGE = (255, 165, 0)
    
    # Couleurs spatiales
    SPACE_BG = (10, 10, 40)
    STAR_COLOR = (200, 200, 255)
    NEBULA_COLOR = (50, 50, 150, 100)
    
    # Gameplay
    PLAYER_SPEED = 5
    PLAYER_LIVES = 3
    PLAYER_INVINCIBLE_TIME = 1500  # ms
    BULLET_SPEED = 10
    ENEMY_SPAWN_RATE = 1000  # ms
    POWERUP_SPAWN_CHANCE = 0.1  # 10%
    DIFFICULTY_INCREMENT = 0.1  # par 100 points
    
    # Animation
    ANIMATION_FPS = 24
    FRAME_DURATION = 1000 // ANIMATION_FPS  # ms

# ... (le reste du code reste identique) ...