<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadPropertyImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'images' => 'required|array|min:1|max:10',
            'images.*' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'images.required' => 'Please select at least one property image.',
            'images.array' => 'Images must be uploaded as a list.',
            'images.min' => 'Please upload at least one image.',
            'images.max' => 'You can upload a maximum of 10 images at a time.',
            'images.*.image' => 'Each uploaded file must be an image.',
            'images.*.mimes' => 'Only JPG, JPEG, PNG, and WEBP images are allowed.',
            'images.*.max' => 'Each image must not be larger than 5 MB.',
        ];
    }
}