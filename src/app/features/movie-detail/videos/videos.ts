import { Component, computed, input } from '@angular/core';
import { Video } from '../../../core/catalog/models/movie';
import { YOUTUBE_WATCH_URL } from '../../../core/config/api';
import { TEXTS } from '../../../core/config/texts';

@Component({
  selector: 'app-videos',
  styleUrl: './videos.css',
  templateUrl: './videos.html',
})
export class Videos {
  readonly videos = input.required<Video[]>();

  protected readonly texts = TEXTS.videos;

  protected readonly trailer = computed(() =>
    this.videos().find((video) => video.site === 'YouTube' && video.type === 'Trailer'),
  );

  protected readonly youtubeUrl = YOUTUBE_WATCH_URL;
}
